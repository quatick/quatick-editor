import React from "react"
import { EditorState, Transaction } from "prosemirror-state"
import cx from "classnames"

import EditorView from "@editor/ui/editor/EditorView"
import createEmptyEditorState from "@editor/createEmptyEditorState"
import EditingArea from "@editor/ui/EditingArea"
import { EditorFrameset } from "@editor/ui/editor/EditorFrameset"
import EditorToolbar from "@editor/ui/editor/EditorToolbar"
import Frag from "@editor/ui/Frag"
import { uuid } from "@editor/util"

import { EditorFramesetProps } from "@editor/ui/editor/EditorFrameset"
import { EditorProps } from "@editor/ui/EditingArea"

type Props = EditorFramesetProps & EditorProps & {
    children?: any | null | undefined
    defaultEditorState: EditorState
    setContent?: any
}

interface State {
    contentHeight?: number
    editorState: EditorState
    contentOverflowHidden?: boolean
    editorView?: EditorView
}

const EMPTY_EDITOR_RUNTIME = {}

export class Editor extends React.Component<Props, State> {

    state: State

    _id: string

    constructor(props: any, context: any) {
        super(props, context)
        this._id = uuid()

        this.state = {
            contentHeight: NaN,
            contentOverflowHidden: false,
            editorView: undefined,
            editorState: props.defaultEditorState || createEmptyEditorState(),
        }
    }

    render() {
        const {
            autoFocus,
            children,
            className,
            disabled,
            embedded,
            header,
            nodeViews,
            placeholder,
            readOnly,
            width = "100%",
            height = "100%",
            fitToContent = true,
        } = this.props

        let { runtime} = this.props

        //        const editorState = this.props.editorState || this.state.editorState || createEmptyEditorState()
        runtime = runtime || EMPTY_EDITOR_RUNTIME
        const {editorView, editorState} = this.state

        const toolbar =
            !!readOnly === true ? null : (
                <EditorToolbar
                    disabled={disabled || undefined}
                    dispatchTransaction={this._dispatchTransaction}
                    editorState={editorState}
                    editorView={editorView}
                    readOnly={readOnly || undefined}
                />
            )

        const body = (
            <Frag>
                <EditingArea
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={autoFocus}
                    disabled={disabled}
                    dispatchTransaction={this._dispatchTransaction}
                    editorState={editorState}
                    embedded={embedded}
                    fitToContent={fitToContent}
                    id={this._id}
                    nodeViews={nodeViews}
                    onReady={this._onReady}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    runtime={runtime}
                />
                {children}
            </Frag>
        )

        return (
            <EditorFrameset
                body={body}
                className={cx("quatick", className)}
                embedded={embedded}
                fitToContent={fitToContent}
                header={header}
                height={height}
                onBlur={this._onBlur}
                toolbar={toolbar}
                width={width}
            />
        )
    }

    _onBlur = (event: MouseEvent) => {
        const { runtime } = this.props
        if (runtime && runtime.onBlur) {
            runtime.onBlur(this.state.editorState, event)
        }
    }

    _dispatchTransaction = (tr: Transaction): void => {
        const {onChange, readOnly} = this.props
        if (readOnly === true) {
            return
        }
        const state = this.state.editorState || EditingArea.EDITOR_EMPTY_STATE

        if (onChange) {
            onChange({ state, transaction: tr })
            this.props.setContent?.(state)
        } else {
            // @ts-ignore
            const editorState = state.apply(tr)
            this.setState({ editorState })
            this.props.setContent?.(editorState)
            //this.state.editorView.updateState()
        }
    }

    _onReady = (editorView: EditorView): void => {
        if (editorView !== this.state.editorView) {
            this.setState({editorView})
            const {onReady} = this.props
            onReady && onReady(editorView)
        }
    }
}
