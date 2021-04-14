import CommandMenuButton from "app/core/components/Editor/src/ui/command/CommandMenuButton"
import HeadingCommand from "app/core/components/Editor/src/HeadingCommand"
import CustomStyleCommand from "app/core/components/Editor/src/CustomStyleCommand"
import React from "react"
import { findActiveHeading } from "app/core/components/Editor/src/ui/findActiveHeading"
import findActiveCustomStyle from "app/core/components/Editor/src/ui/findActiveCustomStyle"
import { EditorState } from "prosemirror-state"
import EditorView from "app/core/components/Editor/src/ui/editor/EditorView"
import { HEADING_NAMES } from "app/core/components/Editor/src/HeadingNodeSpec"
import { HEADING_NAME_DEFAULT } from "app/core/components/Editor/src/ui/findActiveHeading"
import { Transaction } from "prosemirror-state"
import { UICommand } from "app/core/components/Editor/src/ui/UICommand"

export interface HeadingCommands {
  [key: string]: HeadingCommand | UICommand
}

const HEADING_COMMANDS: HeadingCommands = {
  [HEADING_NAME_DEFAULT]: new HeadingCommand(0),
}

HEADING_NAMES.forEach((obj) => {
  if (obj.level) {
    HEADING_COMMANDS[obj.name] = new HeadingCommand(obj.level)
  } else {
    HEADING_COMMANDS[obj.name] = new CustomStyleCommand(obj.customstyles, obj.name)
  }
})

const COMMAND_GROUPS = [HEADING_COMMANDS]

interface Props {
  dispatch: (tr: Transaction) => void
  editorState: EditorState
  editorView?: EditorView
}

class HeadingCommandMenuButton extends React.Component<Props, any> {
  findHeadingName(level) {
    for (let i = 0; i < HEADING_NAMES.length; i++) {
      if (HEADING_NAMES[i].level === level) {
        return HEADING_NAMES[i].name
      }
    }
    return undefined
  }

  render() {
    const { dispatch, editorState, editorView } = this.props

    let customStyleName
    const headingLevel = findActiveHeading(editorState)
    if (0 < headingLevel) {
      customStyleName = this.findHeadingName(headingLevel)
    } else {
      customStyleName = findActiveCustomStyle(editorState)
    }

    return (
      <CommandMenuButton
        className="width-100" // [FS] IRAD-1008 2020-07-16
        // Disable font type menu on editor disable state
        commandGroups={COMMAND_GROUPS}
        disabled={editorView && editorView.editable ? false : true}
        dispatch={dispatch}
        editorState={editorState}
        editorView={editorView}
        label={customStyleName}
      />
    )
  }
}

export default HeadingCommandMenuButton
