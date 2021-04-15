import {EditorState, Transaction} from "prosemirror-state"
import React from "react"

import EditorView from "@editor/ui/editor/EditorView"
import FontSizeCommand from "@editor/FontSizeCommand"
import CommandMenuButton from "@editor/ui/command/CommandMenuButton"
import findActiveFontSize from "@editor/ui/findActiveFontSize"

export const FONT_PT_SIZES = [
    8,
    9,
    10,
    11,
    12,
    14,
    18,
    24,
    30,
    36,
    48,
    60,
    72,
    90,
]

const FONT_PT_SIZE_COMMANDS = FONT_PT_SIZES.reduce((memo, size) => {
    memo[` ${size} `] = new FontSizeCommand(size)
    return memo
}, {})

const COMMAND_GROUPS = [
    {Default: new FontSizeCommand(0)},
    FONT_PT_SIZE_COMMANDS,
]

class FontSizeCommandMenuButton extends React.Component<any, any> {
    props: {
        dispatch: (tr: Transaction) => void
        editorState: EditorState
        editorView: EditorView
    }

    render() {
        const {dispatch, editorState, editorView} = this.props
        const fontSize = findActiveFontSize(editorState)
        const className = String(fontSize).length <= 2 ? "width-30" : "width-60"
        return (
            <CommandMenuButton
                className={className} // [FS] IRAD-1008 2020-07-16
                // Disable font size menu on editor disable state
                commandGroups={COMMAND_GROUPS}
                disabled={editorView.editable}
                dispatch={dispatch}
                editorState={editorState}
                editorView={editorView}
                label={fontSize}
            />
        )
    }
}

export default FontSizeCommandMenuButton
