import CustomNodeView from "app/core/components/Editor/src/ui/custom/CustomNodeView"
import React from "react"
import createPopUp from "app/core/components/Editor/src/ui/createPopUp"
import cx from "classnames"
import {Decoration} from "prosemirror-view"
import {Node} from "prosemirror-model"
import {atViewportCenter} from "app/core/components/Editor/src/ui/PopUpPosition"
import { uuid } from "app/core/components/Editor/src/util"
import {NodeViewProps} from "app/core/components/Editor/src/ui/custom/CustomNodeView"
import {prefixed} from "app/core/components/Editor/src/util"
import EmbedURLEditor from "app/core/components/Editor/src/ui/EmbedURLEditor"

class EmbedViewBody extends React.Component<NodeViewProps, any> {

    state = {
        isEditing: false,
    }

    _inlineEditor: any = null
    _id = uuid()
    _mounted = false

    componentDidMount(): void {
        this._mounted = true
        this._renderInlineEditor()
    }

    componentWillUnmount(): void {
        this._mounted = false
    }

    componentDidUpdate(prevProps: NodeViewProps): void {
        this._renderInlineEditor()
    }

    render() {
        const readOnly = false
        const {node, selected, focused} = this.props
        const {src} = node.attrs

        const {isEditing} = this.state

        const active = (focused || isEditing) && !readOnly
        const className = cx(prefixed("embed-view-body"), {active, selected})
        return (
            <div
                className={className}
                data-active={active ? "true" : null}
                data-embed={src || ""}
                id={this._id}
            >
                <div className="placeholder">
                    <span className="src">{src}</span>
                    <span className="quatick-icon ondemand_video">ondemand_video</span>
                </div>
            </div>
        )
    }

    _renderInlineEditor(): void {
        const el = document.getElementById(this._id)
        if (!el || el.getAttribute("data-active") !== "true") {
            this._inlineEditor && this._inlineEditor.close()
            return
        }
        const {src} = this.props.node.attrs
        const editorProps = { src }
        if (this._inlineEditor) {
            this._inlineEditor.update(editorProps)
        } else {
            this._inlineEditor = createPopUp(EmbedURLEditor, editorProps, {
                anchor: el,
                autoDismiss: false,
                container: this.props.editorView.frameset,
                position: atViewportCenter,
                onClose: (attrs) => {
                    this._onChange(attrs)
                    this._inlineEditor = null
                },
            })
        }
    }

    _onEditStart = (): void => {
        this.setState({isEditing: true})
    }

    _onEditEnd = (): void => {
        this.setState({isEditing: false})
    }

    _onChange = (
        value:
            | {src?: string; delete?: boolean}
            | null
            | undefined,
    ): void => {
        if (!this._mounted) {
            return
        }
        const {getPos, editorView} = this.props
        let tr = editorView.state.tr
        if (!value) {
            return
        }
        if (value.delete) {
            editorView.dispatch(
                tr.deleteSelection()
            )
            return
        }
        if (value.src) {
            tr = tr.setNodeMarkup(getPos(), undefined, { src: value.src })
            editorView.dispatch(tr)
        }
    }
}


class EmbedNodeView extends CustomNodeView {
    // @override
    createDOMElement(): HTMLElement {
        const el = document.createElement("span")
        el.className = prefixed("embed-view")
        this._updateDOM(el)
        return el
    }

    // @override
    update(node: Node, decorations: Array<Decoration>): boolean {
        super.update(node, decorations)
        this._updateDOM(this.dom)
        return true
    }

    // @override
    renderReactComponent() {
        return <EmbedViewBody {...this.props} />
    }

    _updateDOM(el: HTMLElement): void {
        const {align} = this.props.node.attrs
        let className = prefixed("embed-view")
        if (align) {
            className += " align-" + align
        }

        el.className = className
    }
}

export default EmbedNodeView
