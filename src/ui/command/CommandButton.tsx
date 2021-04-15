import {EditorState, Transaction} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import React from "react"

import CustomButton from "@editor/ui/custom/CustomButton"
import UICommand from "@editor/ui/UICommand"

interface Props {
    className?: string
    command: UICommand
    disabled?: boolean
    dispatch: (tr: Transaction) => void
    editorState: EditorState
    commandGroups?: any
    editorView: EditorView | null
    icon?: string | React.ReactNode | null
    label?: string | React.ReactNode | null
    title?: string
}


class CommandButton extends React.Component<Props, any> {

    render() {
        const {
            label,
            className,
            command,
            editorState,
            editorView,
            icon,
            title,
        } = this.props
        let disabled = this.props.disabled
        if (!!disabled === false) {
            disabled =
                !editorView || !command.isEnabled(editorState, editorView)
        }

        return (
            <CustomButton
                active={command.isActive(editorState)}
                className={className}
                disabled={disabled}
                icon={icon}
                label={label}
                onClick={this._onUIEnter}
                onMouseEnter={this._onUIEnter}
                title={title}
                value={command}
            />
        )
    }
    // eslint-disable-next-line no-undef
    _onUIEnter = (
        command: UICommand,
        event: React.SyntheticEvent<HTMLButtonElement>
    ): void => {
        if (command.shouldRespondToUIEvent(event)) {
            this._execute(command, event)
        }
    }
    // eslint-disable-next-line no-undef
    _execute = (
        value: any,
        event: React.SyntheticEvent<HTMLButtonElement>,
    ): void => {
        const {command, editorState, dispatch, editorView} = this.props
        command.execute(editorState, dispatch, editorView, event)
    }
}

export default CommandButton
