import * as React from "react"

import { prefixed } from "app/core/components/Editor/src/util"

class CustomMenu extends React.Component<any, any> {
    render() {
        const {children} = this.props
        return (
            <div className={`${prefixed("custom-menu")} ${prefixed("custom-scrollbar")}`}>
                {children}
            </div>
        )
    }
}

export default CustomMenu
