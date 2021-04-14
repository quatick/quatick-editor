import nullthrows from "nullthrows"
import {EditorState} from "prosemirror-state"

import ColorEditor from "app/core/components/Editor/src/ui/ColorEditor"
import UICommand from "app/core/components/Editor/src/ui/UICommand"
import applyMark from "app/core/components/Editor/src/applyMark"
import createPopUp, { PopUpHandle } from "app/core/components/Editor/src/ui/createPopUp"
import findNodesWithSameMark from "app/core/components/Editor/src/findNodesWithSameMark"
import isTextStyleMarkCommandEnabled from "app/core/components/Editor/src/isTextStyleMarkCommandEnabled"
import EditorView from "app/core/components/Editor/src/ui/editor/EditorView"
import {MARK_TEXT_HIGHLIGHT} from "app/core/components/Editor/src/MarkNames"
import {Transaction} from "prosemirror-state"

class TextHighlightCommand extends UICommand {
    _popUp: PopUpHandle | null = null

    isEnabled = (state: EditorState): boolean => {
        return isTextStyleMarkCommandEnabled(state, MARK_TEXT_HIGHLIGHT)
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
        const target = nullthrows(event).currentTarget
        if (!(target instanceof HTMLElement)) {
            return Promise.resolve(undefined)
        }

        const {doc, selection, schema} = state
        const markType = schema.marks[MARK_TEXT_HIGHLIGHT]
        const {from, to} = selection
        const result = findNodesWithSameMark(doc, from, to, markType)
        const hex = result ? result?.mark?.attrs.highlightColor : null
        const anchor = event ? event.currentTarget : null
        return new Promise(resolve => {
            this._popUp = createPopUp(
                ColorEditor,
                {hex},
                {
                    container: view.frameset,
                    anchor,
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
        color: string | null | undefined,
    ): boolean => {
        if (dispatch && color !== undefined) {
            const {schema} = state
            let {tr} = state
            const markType = schema.marks[MARK_TEXT_HIGHLIGHT]
            const attrs = color ? {highlightColor: color} : null
            tr = applyMark(
                tr.setSelection(state.selection),
                schema,
                markType,
                attrs,
            )
            if (tr.docChanged || tr.storedMarksSet) {
                // If selection is empty, the color is added to `storedMarks`, which
                // works like `toggleMark`
                // (see https://prosemirror.net/docs/ref/#commands.toggleMark).
                dispatch && dispatch(tr)
                return true
            }
        }
        return false
    }
}

export default TextHighlightCommand
