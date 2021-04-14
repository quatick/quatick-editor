import {Fragment, Schema} from "prosemirror-model"
import {EditorState, Transaction,TextSelection} from "prosemirror-state"

import {EMBED} from "app/core/components/Editor/src/NodeNames"
import {MARK_LINK} from "app/core/components/Editor/src/MarkNames"
import { hideCursorPlaceholder } from "app/core/components/Editor/src/CursorPlaceholderPlugin"
import { showSelectionPlaceholder } from "app/core/components/Editor/src/SelectionPlaceholderPlugin"
import findNodesWithSameMark from "app/core/components/Editor/src/findNodesWithSameMark"
import EditorView from "app/core/components/Editor/src/ui/editor/EditorView"
import EmbedURLEditor from "app/core/components/Editor/src/ui/EmbedURLEditor"
import UICommand from "app/core/components/Editor/src/ui/UICommand"
import createPopUp, { PopUpHandle } from "app/core/components/Editor/src/ui/createPopUp"

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
