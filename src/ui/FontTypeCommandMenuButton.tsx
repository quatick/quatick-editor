import React from "react"
import { EditorState, Transaction } from "prosemirror-state"
import CommandMenuButton from "app/core/components/Editor/src/ui/command/CommandMenuButton"
import FontTypeCommand from "app/core/components/Editor/src/FontTypeCommand"
import { UICommands } from "app/core/components/Editor/src/ui/UICommand"
import findActiveFontType from "app/core/components/Editor/src/ui/findActiveFontType"
import EditorView from "app/core/components/Editor/src/ui/editor/EditorView"
import { FONT_TYPE_NAMES } from "app/core/components/Editor/src/FontTypeMarkSpec"
import { FONT_TYPE_NAME_DEFAULT } from "app/core/components/Editor/src/ui/findActiveFontType"


const FONT_TYPE_COMMANDS: UICommands = {
    [FONT_TYPE_NAME_DEFAULT]: new FontTypeCommand(""),
}

FONT_TYPE_NAMES.forEach(name => {
    FONT_TYPE_COMMANDS[name] = new FontTypeCommand(name)
})

const COMMAND_GROUPS = [FONT_TYPE_COMMANDS]

class FontTypeCommandMenuButton extends React.Component<any, any> {
    props: {
        dispatch: (tr: Transaction) => void
        editorState: EditorState
        editorView: EditorView | undefined
    }

    render() {
        const {dispatch, editorState, editorView} = this.props
        const fontType = findActiveFontType(editorState)
        return (
            <CommandMenuButton
                className="width-100" // [FS] IRAD-1008 2020-07-16
                // Disable font type menu on editor disable state
                commandGroups={COMMAND_GROUPS}
                disabled={editorView && editorView.editable ? false : true}
                dispatch={dispatch}
                editorState={editorState}
                editorView={editorView}
                label={fontType}
            />
        )
    }
}

export default FontTypeCommandMenuButton
