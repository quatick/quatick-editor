import React from "react"
import { EditorState } from "prosemirror-state"

import EditorView from "app/core/components/Editor/src/ui/editor/EditorView"
import CommandMenuButton from "app/core/components/Editor/src/ui/command/CommandMenuButton"
import { TABLE_COMMANDS_GROUP } from "app/core/components/Editor/src/ui/editor/EditorToolbarConfig"
import {prefixed} from "app/core/components/Editor/src/util"
import Icon from "app/core/components/Editor/src/ui/Icon"

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
