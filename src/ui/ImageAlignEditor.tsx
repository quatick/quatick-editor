import CustomButton from './CustomButton'
import React from 'react'

import {prefixed} from '../util'

const ImageAlignValues = {
    NONE: {
        value: null,
        text: 'Inline',
    },
    LEFT: {
        value: 'left',
        text: 'Float left',
    },
    CENTER: {
        value: 'center',
        text: 'Center',
    },
    RIGHT: {
        value: 'right',
        text: 'Float right',
    },
}

export type ImageInlineEditorValue = {
    align: string | null | undefined
}

class ImageInlineEditor extends React.Component<any, any> {
    props: {
        onSelect: (val: ImageInlineEditorValue) => void
        value: ImageInlineEditorValue | null | undefined
    }

    render() {
        const align = this.props.value ? this.props.value.align : null
        const onClick = this._onClick
        const buttons = Object.keys(ImageAlignValues).map(key => {
            const {value, text} = ImageAlignValues[key]
            return (
                <CustomButton
                    active={align === value}
                    key={key}
                    label={text}
                    onClick={onClick}
                    value={value}
                />
            )
        })

        return <div className={prefixed('inline-editor custom-')}>{buttons}</div>
    }

    _onClick = (align: string | null | undefined): void => {
        this.props.onSelect({align: align})
    }
}

export default ImageInlineEditor
