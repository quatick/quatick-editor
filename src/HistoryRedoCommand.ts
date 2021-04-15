import {redo} from "prosemirror-history"
import {Transaction, EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"

import UICommand from "@editor/ui/UICommand"

class HistoryRedoCommand extends UICommand {
    execute = (
        state: EditorState,
        dispatch: (tr: Transaction) => void | null | undefined,
        view?: EditorView | null,
    ): boolean => {
        return redo(state, dispatch)
    }
}

export default HistoryRedoCommand
