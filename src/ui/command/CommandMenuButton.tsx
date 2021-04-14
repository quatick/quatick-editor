import cx from "classnames"
import {EditorState, Transaction} from "prosemirror-state"
import React from "react"

import EditorView from "app/core/components/Editor/src/ui/editor/EditorView"
import CommandMenu from "app/core/components/Editor/src/ui/command/CommandMenu"
import CustomButton from "app/core/components/Editor/src/ui/custom/CustomButton"
import UICommand from "app/core/components/Editor/src/ui/UICommand"
import createPopUp, { PopUpHandle } from "app/core/components/Editor/src/ui/createPopUp"
import { prefixed,uuid } from "app/core/components/Editor/src/util"

interface CommandGroup {
    // TODO: change the any
    [key: string]: UICommand | any
}

type CommandGroupsT = Array<CommandGroup>


interface Props {
    className?: string | null | undefined
    // @ts-ignore
    commandGroups: CommandGroupsT
    disabled?: boolean | null | undefined
    dispatch: (tr: Transaction) => void | null | undefined,
    editorState?: EditorState
    editorView?: EditorView
    icon?: string | React.ReactNode | React.ReactElement<any> | null
    label?: string | React.ReactNode | React.ReactElement<any> | null
    title?: string
}

interface State  {
    expanded: boolean
}

class CommandMenuButton extends React.Component<Props, State> {

    _menu: PopUpHandle | null = null
    _id = uuid()

    state = {
        expanded: false,
    }

    render() {
        const {
            className,
            label,
            commandGroups,
            editorState,
            editorView,
            icon,
            disabled,
            title,
        } = this.props
        const enabled =
            !disabled &&
            commandGroups.some((group, ii) => {
                return Object.keys(group).some(label => {
                    const command = group[label]
                    let disabledVal = true
                    try {
                        disabledVal =
                            !editorView ||
                            !command.isEnabled(editorState, editorView)
                    } catch (ex) {
                        disabledVal = false
                    }
                    return !disabledVal
                })
            })

        const {expanded} = this.state
        const buttonClassName = cx(className, {
            [prefixed("custom-menu-button")]: true,
            expanded,
        })

        return (
            // @ts-ignore
            <CustomButton
                className={buttonClassName}
                disabled={!enabled}
                icon={icon}
                id={this._id}
                label={label}
                onClick={this._onClick}
                title={title}
            />
        )
    }

    componentWillUnmount(): void {
        this._hideMenu()
    }

    _onClick = (): void => {
        const expanded = !this.state.expanded
        this.setState({
            expanded,
        })
        expanded ? this._showMenu() : this._hideMenu()
    }

    _hideMenu = (): void => {
        const menu = this._menu
        this._menu = null
        menu && menu.close(null)
    }

    _showMenu = (): void => {
        const menu = this._menu
        const menuProps = {
            ...this.props,
            onCommand: this._onCommand,
        }
        if (menu) {
            menu.update(menuProps)
        } else {
            this._menu = createPopUp(CommandMenu, menuProps, {
                anchor: document.getElementById(this._id),
                container: this.props.editorView?.frameset,
                onClose: this._onClose,
            })
        }
    }

    _onCommand = (): void => {
        this.setState({expanded: false})
        this._hideMenu()
    }

    _onClose = (): void => {
        if (this._menu) {
            this.setState({expanded: false})
            this._menu = null
        }
    }
}

export default CommandMenuButton
