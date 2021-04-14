import React from 'react'
import createPopUp, { PopUpHandle } from './createPopUp'
import {atAnchorBottomCenter} from './PopUpPosition'
import {uuid,prefixed} from '../util'

class TooltipView extends React.Component<any, any> {
    render() {
        const {tooltip} = this.props
        return (
            <div className={`${prefixed('tooltip-view')} ${prefixed('animation-fade-in')}`}>
                {tooltip}
            </div>
        )
    }
}

class TooltipSurface extends React.Component<any, any> {
    _id = uuid()
    _popUp: PopUpHandle | null = null

    props: {
        tooltip?: string
        children?: any
    }

    componentWillUnmount(): void {
        this._popUp && this._popUp.close(null)
    }

    render() {
        const {tooltip, children} = this.props
        return (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <span
                aria-label={tooltip}
                className={prefixed('tooltip-surface')}
                data-tooltip={tooltip}
                id={this._id}
                onMouseDown={tooltip ? this._onMouseLeave : undefined}
                onMouseEnter={tooltip ? this._onMouseEnter : undefined}
                onMouseLeave={tooltip ? this._onMouseLeave : undefined}
                role="tooltip"
            >
                {children}
            </span>
        )
    }

    _onMouseEnter = (): void => {
        if (!this._popUp) {
            const {tooltip} = this.props
            this._popUp = createPopUp(
                TooltipView,
                {tooltip},
                {
                    anchor: document.getElementById(this._id),
                    onClose: this._onClose,
                    position: atAnchorBottomCenter,
                },
            )
        }
    }

    _onMouseLeave = (): void => {
        this._popUp && this._popUp.close(null)
        this._popUp = null
    }

    _onClose = (): void => {
        this._popUp = null
    }
}

export default TooltipSurface
