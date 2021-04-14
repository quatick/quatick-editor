import {EditorState} from 'prosemirror-state'
import {EditorView} from 'prosemirror-view'
import {Transaction} from 'prosemirror-state'
import UICommand from './ui/UICommand'

type ExecuteCall = (
    state: EditorState,
    dispatch: (tr: Transaction) => void | null | undefined,
    view?: EditorView,
) => boolean

export default function createCommand(execute: ExecuteCall): UICommand {
    class CustomCommand extends UICommand {
        isEnabled = (state: EditorState): boolean => {
            return this.execute(state, null, null)
        }

        execute = (
            state: EditorState,
            dispatch: null | ((tr: Transaction) => void | null | undefined),
            view: EditorView | null,
        ): boolean => {
            const tr = state.tr
            let endTr = tr
            execute(
                state,
                nextTr => {
                    endTr = nextTr
                    dispatch && dispatch(endTr)
                },
                view || undefined,
            )
            return endTr.docChanged || tr !== endTr
        }
    }
    return new CustomCommand()
}
