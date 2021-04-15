import { toggleMark } from "prosemirror-commands"
import { EditorState, Transaction, TextSelection } from "prosemirror-state"
import { EditorView } from "prosemirror-view"

import findNodesWithSameMark from "@editor/findNodesWithSameMark"
import UICommand from "@editor/ui/UICommand"

class MarkToggleCommand extends UICommand {
    _markName: string

    constructor(markName: string) {
        super()
        this._markName = markName
    }

    isActive = (state: EditorState): boolean => {
        const {schema, doc, selection} = state
        const {from, to} = selection
        const markType = schema.marks[this._markName]
        if (markType && from < to) {
            return !!findNodesWithSameMark(doc, from, to - 1, markType)
        }
        return false
    }

    execute = (
        state: EditorState,
        dispatch: (tr: Transaction) => void | null | undefined,
        view?: EditorView | null | undefined,
    ): boolean => {
        const {schema, selection, tr} = state
        const markType = schema.marks[this._markName]
        if (!markType) {
            return false
        }

        if (selection.empty && !(selection instanceof TextSelection)) {
            return false
        }

        const {from, to} = selection
        if (tr && to === from + 1) {
            const node = tr.doc.nodeAt(from)
            if (node?.isAtom && !node.isText && node.isLeaf) {
                // An atomic node (e.g. Image) is selected.
                return false
            }
        }

        // TODO: Replace `toggleMark` with transform that does not change scroll
        // position.
        return toggleMark(markType)(state, dispatch)
    }
}

export default MarkToggleCommand
