import cx from "classnames"
import * as React from "react"

import preventEventDefault from "@editor/ui/preventEventDefault"

export type PointerSurfaceProps = {
  active?: boolean | null | undefined
  children?: any
  className?: string | null | undefined
  disabled?: boolean
  id?: string
  onClick?: (val: any, e: React.SyntheticEvent) => void | null | undefined
  onMouseEnter?: (val: any, e: React.SyntheticEvent) => void | null | undefined
  style?: Object
  title?: string
  value?: any
}

class PointerSurface extends React.Component<any, any> {
  props: PointerSurfaceProps

  _clicked = false
  _mul = false
  _pressedTarget: HTMLElement | null = null
  _unmounted = false

  state = { pressed: false }

  render() {
    const { className, disabled, active, id, style, title, children } = this.props
    const { pressed } = this.state

    const buttonClassName = cx(className, {
      active: active,
      disabled: disabled,
      pressed: pressed,
    })

    return (
      <span
        aria-disabled={disabled}
        aria-pressed={pressed}
        className={buttonClassName}
        // @ts-ignore
        disabled={disabled}
        id={id}
        onKeyPress={disabled ? preventEventDefault : this._onMouseUp}
        onMouseDown={disabled ? preventEventDefault : this._onMouseDown}
        onMouseEnter={disabled ? preventEventDefault : this._onMouseEnter}
        onMouseLeave={disabled ? undefined : this._onMouseLeave}
        onMouseUp={disabled ? preventEventDefault : this._onMouseUp}
        role="button"
        style={style}
        tabIndex={disabled ? undefined : 0}
        title={title}
      >
        {children}
      </span>
    )
  }

  componentWillUnmount(): void {
    this._unmounted = true
    if (this._mul) {
      this._mul = false
      document.removeEventListener("mouseup", this._onMouseUpCapture, true)
    }
  }

  _onMouseEnter = (e: React.SyntheticEvent<any>): void => {
    this._pressedTarget = null
    e.preventDefault()
    const { onMouseEnter, value } = this.props
    onMouseEnter && onMouseEnter(value, e)
  }

  _onMouseLeave = (e: React.SyntheticEvent<any>): void => {
    this._pressedTarget = null
    const mouseUpEvent: any = e
    this._onMouseUpCapture(mouseUpEvent)
  }

  _onMouseDown = (e: any): void => {
    e.preventDefault()

    this._pressedTarget = null
    this._clicked = false

    if (e.which === 3 || e.button === 2) {
      // right click.
      return
    }

    this.setState({ pressed: true })
    this._pressedTarget = e.currentTarget
    this._clicked = false

    if (!this._mul) {
      document.addEventListener("mouseup", this._onMouseUpCapture, true)
      this._mul = true
    }
  }

  _onMouseUp = (e: React.SyntheticEvent<any>): void => {
    e.preventDefault()

    if (this._clicked || e.type === "keypress") {
      const { onClick, value, disabled } = this.props
      !disabled && onClick && onClick(value, e)
    }

    this._pressedTarget = null
    this._clicked = false
  }

  _onMouseUpCapture = (e: MouseEvent): void => {
    if (this._mul) {
      this._mul = false
      document.removeEventListener("mouseup", this._onMouseUpCapture, true)
    }
    const target = e.target
    this._clicked =
      this._pressedTarget instanceof HTMLElement &&
      target instanceof HTMLElement &&
      (target === this._pressedTarget ||
        target.contains(this._pressedTarget) ||
        this._pressedTarget.contains(target))
    this.setState({ pressed: false })
  }
}

export default PointerSurface
