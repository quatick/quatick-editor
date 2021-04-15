import {Fragment, Schema} from "prosemirror-model"
import {EditorState, Transaction,TextSelection} from "prosemirror-state"

import {EMBED} from "@editor/NodeNames"
import {MARK_LINK} from "@editor/MarkNames"
import { hideCursorPlaceholder } from "@editor/CursorPlaceholderPlugin"
import { showSelectionPlaceholder } from "@editor/SelectionPlaceholderPlugin"
import findNodesWithSameMark from "@editor/findNodesWithSameMark"
import EditorView from "@editor/ui/editor/EditorView"
import EmbedURLEditor from "@editor/ui/EmbedURLEditor"
import UICommand from "@editor/ui/UICommand"
import createPopUp, { PopUpHandle } from "@editor/ui/createPopUp"

function insertEmbed(
    tr: Transaction,
    schema: Schema,
    src: string | null | undefined,
): Transaction {
    // @ts-ignore
    const {selection} = tr

    if (!selection) {
        return tr
    }

    const {from, to} = selection
    if (from !== to) {
        return tr
    }

    const embedNode = schema.nodes[EMBED]
    if (!embedNode) {
        return tr
    }

    const attrs = {
        src,
    }

    const node = embedNode.create(attrs, undefined, undefined)
    const frag = Fragment.from(node)
    tr = tr.insert(from, frag)
    return tr
}


class EmbedSetURLCommand extends UICommand {
    _popUp: PopUpHandle | null = null

    isEnabled = (
        state: EditorState,
        view: EditorView,
    ): boolean => {
        const tr = state
        const {selection} = tr
        if (selection instanceof TextSelection) {
            return selection.from === selection.to
        }
        return false
    }


    waitForUserInput = (
        state: EditorState,
        dispatch: (tr: Transaction) => void | null | undefined,
        view: EditorView,
        event: React.SyntheticEvent | null | undefined,
    ): Promise<any> => {
        if (this._popUp) {
            return Promise.resolve(undefined)
        }

        if (dispatch) {
            // @ts-ignore
            dispatch(showSelectionPlaceholder(state))
        }

        const {doc, schema, selection} = state
        const markType = schema.marks[MARK_LINK]
        if (!markType) {
            return Promise.resolve(undefined)
        }
        const {from, to} = selection
        const result = findNodesWithSameMark(doc, from, to, markType)
        const src = result ? result?.mark?.attrs.src : null
        return new Promise(resolve => {
            this._popUp = createPopUp(
                EmbedURLEditor,
                {src},
                {
                    modal: true,
                    container: view.frameset,
                    onClose: val => {
                        if (this._popUp) {
                            this._popUp = null
                            resolve(val)
                        }
                    },
                },
            )
        })
    }

    executeWithUserInput = (
        state: EditorState,
        dispatch: (tr: Transaction) => void | null | undefined,
        view: EditorView,
        value?: {src?:string},
    ): boolean => {

        if (dispatch) {
            const {selection, schema} = state
            let {tr} = state
            // @ts-ignore
            tr = view ? hideCursorPlaceholder(view.state) : tr
            tr = tr.setSelection(selection)
            if (value && value.src) {
                // @ts-ignore
                tr = insertEmbed(tr, schema, value.src)
            }
            dispatch(tr)
            view && view.focus()
        }

        return false
    }
}

export default EmbedSetURLCommand
