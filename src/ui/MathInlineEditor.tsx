import React from "react"
import CustomButton from "@editor/ui/custom/CustomButton"
import EditorView from "@editor/ui/editor/EditorView"
import MathEditor from "@editor/ui/MathEditor"
import createPopUp, { PopUpHandle } from "@editor/ui/createPopUp"
import { prefixed } from "@editor/util"

const MathAlignValues = {
    NONE: {
        value: null,
        text: "Inline",
    },
    CENTER: {
        value: "center",
        text: "Break text",
    },
}

export type MathInlineEditorValue = {
    align: string | null | undefined
    math: string
}

interface MathInlineEditorProps {
    onEditEnd: () => void
    onEditStart: () => void
    onSelect: (val: any) => void
    value: MathInlineEditorValue | null | undefined
    editorView: EditorView
}

class MathInlineEditor extends React.Component<MathInlineEditorProps, any> {

    editorRef = React.createRef<HTMLDivElement>()
    _popUp: PopUpHandle | null = null

    componentWillUnmount(): void {
        this._popUp && this._popUp.close(null)
    }

    render() {
        const {align, math} = this.props.value || {}
        const onClick = this._onClick
        const buttons = Object.keys(MathAlignValues).map(key => {
            const {value, text} = MathAlignValues[key]
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

        return (
            <div className={prefixed("inline-editor")} ref={this.editorRef}>
                {buttons}
                <CustomButton
                    key="edit"
                    label="Edit Latex"
                    onClick={this._editLatex}
                    value={math || ""}
                />
            </div>
        )
    }

    _onClick = (align: string | null | undefined): void => {
        const value = this.props.value || {}
        this.props.onSelect({...value, align})
    }

    _editLatex = (math: string): void => {
        if (this._popUp) {
            return
        }
        const {editorView, value} = this.props
        const props = {
            runtime: editorView.runtime,
            initialValue: (value && value.math) || "",
        }

        this._popUp = createPopUp(MathEditor, props, {
            autoDismiss: false,
            modal: true,
            container: this.props.editorView.frameset,
            onClose: math => {
                if (this._popUp) {
                    this._popUp = null
                    if (math !== undefined) {
                        const value = this.props.value || {}
                        this.props.onSelect({...value, math})
                    }
                    this.props.onEditEnd()
                }
            },
        })
        this.props.onEditStart()
    }
}

export default MathInlineEditor
