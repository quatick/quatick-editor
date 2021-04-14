import React from "react"
import CustomButton from "app/core/components/Editor/src/ui/custom/CustomButton"
import { prefixed } from "app/core/components/Editor/src/util"

class CustomMenuItemSeparator extends React.Component<any, any> {
    render() {
        return <div className={prefixed("custom-menu-item-separator")} />
    }
}

class CustomMenuItem extends React.Component<any, any> {
    static Separator = CustomMenuItemSeparator

    props: {
        label: string
        disabled?: boolean | undefined
        onClick: (
            value: any,
            e: React.SyntheticEvent,
        ) => void | null | undefined
        onMouseEnter: (
            value: any,
            e: React.SyntheticEvent,
        ) => void | null | undefined
        value: any
        active?: boolean
    }

    render() {
        return <CustomButton {...this.props} className={prefixed("custom-menu-item")} />
    }
}

export default CustomMenuItem
