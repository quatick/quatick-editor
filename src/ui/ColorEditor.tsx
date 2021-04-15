import React from "react"
import Color from "color"

import {prefixed} from "@editor/util"
import CustomButton from "@editor/ui/custom/CustomButton"
import clamp from "@editor/ui/clamp"

function generateGreyColors(count: number): Array<Color> {
    let cc = 255
    const interval = cc / count
    const colors: Array<any> = []
    while (cc > 0) {
        const color = Color({r: cc, g: cc, b: cc})
        cc -= interval
        cc = Math.floor(cc)
        colors.unshift(color)
    }
    return colors
}

function generateRainbowColors(
    count: number,
    saturation: number,
    lightness: number,
): Array<Color> {
    const colors: Array<any> = []
    const interval = 360 / count
    const ss = clamp(0, saturation, 100)
    const ll = clamp(0, lightness, 100)
    let hue = 0
    while (hue < 360) {
        const hsl = `hsl(${hue},${ss}%,${ll}%)`
        const color = Color(hsl)
        colors.unshift(color)
        hue += interval
    }
    return colors
}

class ColorEditor extends React.Component<any, any> {
    props: {
        close: (arg0: string | null | undefined) => void
        hex?: string | null | undefined
    }

    render() {
        const renderColor = this._renderColor
        const selectedColor = this.props.hex
        return (
            <div className={prefixed("color-editor")}>
                <div className={prefixed("color-editor-section")}>
                    <CustomButton
                        active={!selectedColor}
                        className={prefixed("color-editor-color-transparent")}
                        label="Transparent"
                        onClick={this._onSelectColor}
                        value="rgba(0,0,0,0)"
                    />
                </div>
                <div className={prefixed("color-editor-section")}>
                    {generateGreyColors(10).map(renderColor)}
                </div>
                <div className={prefixed("color-editor-section")}>
                    {generateRainbowColors(10, 90, 50).map(renderColor)}
                </div>
                <div className={prefixed("color-editor-section")}>
                    {generateRainbowColors(30, 70, 70).map(renderColor)}
                </div>
                <div className={prefixed("color-editor-section")}>
                    {generateRainbowColors(30, 90, 30).map(renderColor)}
                </div>
            </div>
        )
    }

    _renderColor = (color: Color, index: number) => {
        const selectedColor = this.props.hex
        const hex = color.hex().toLowerCase()
        const style = {backgroundColor: hex}
        const active = selectedColor ? selectedColor.toLowerCase() === hex : false
        return (
            <CustomButton
                active={active}
                className={prefixed("color-editor-cell")}
                key={`${hex}-${index}`}
                label=""
                onClick={this._onSelectColor}
                style={style}
                value={hex}
            />
        )
    }

    _onSelectColor = (hex: string): void => {
        this.props.close(hex)
    }
}
export default ColorEditor
