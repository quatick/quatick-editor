import React from "react"
import { EditorState } from "prosemirror-state"

import EditorView from "@editor/ui/editor/EditorView"
import CommandMenuButton from "@editor/ui/command/CommandMenuButton"
import { TABLE_COMMANDS_GROUP } from "@editor/ui/editor/EditorToolbarConfig"
import {prefixed} from "@editor/util"
import Icon from "@editor/ui/Icon"

type Props = {
    editorState: EditorState
    editorView: EditorView
}

class TableCellMenu extends React.Component<any, any> {
    _menu = null

    props: Props

    render() {
        const {editorState, editorView} = this.props
        return (
            <CommandMenuButton
                className={prefixed("table-cell-menu")}
                commandGroups={TABLE_COMMANDS_GROUP}
                dispatch={editorView.dispatch}
                editorState={editorState}
                editorView={editorView}
                icon={Icon.get("edit")}
                title="Edit"
            />
        )
    }
}

export default TableCellMenu
