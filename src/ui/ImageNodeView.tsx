import cx from "classnames"
import {Node} from "prosemirror-model"
import {Decoration} from "prosemirror-view"
import {NodeSelection} from "prosemirror-state"
import React from "react"
import ReactDOM from "react-dom"

import CustomNodeView from "@editor/ui/custom/CustomNodeView"
import Icon from "@editor/ui/Icon"
import ImageInlineEditor from "@editor/ui/ImageInlineEditor"
import ImageResizeBox from "@editor/ui/ImageResizeBox"
import {MIN_SIZE} from "@editor/ui/ImageResizeBox"
import {atAnchorBottomCenter} from "@editor/ui/PopUpPosition"
import ResizeObserver from "@editor/ui/ResizeObserver"
import createPopUp from "@editor/ui/createPopUp"
import resolveImage from "@editor/ui/resolveImage"
import {uuid, prefixed} from "@editor/util"

import {EditorRuntime} from "@editor/Types"
import {NodeViewProps} from "@editor/ui/custom/CustomNodeView"
import {ResizeObserverEntry} from "@editor/ui/ResizeObserver"

const EMPTY_SRC =
    "data:image/gif;base64," +
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

/* This value must be synced with the margin defined at .image-view */
const IMAGE_MARGIN = 0

const MAX_SIZE = 100000
const IMAGE_PLACEHOLDER_SIZE = 24

const DEFAULT_ORIGINAL_SIZE = {
    src: "",
    complete: false,
    height: 0,
    width: 0,
}

// Get the maxWidth that the image could be resized to.
function getMaxResizeWidth(el: any): number {
    // Ideally, the image should bot be wider then its containing element.
    let node: any = el.parentElement
    while (node && !node.offsetParent) {
        node = node.parentElement
    }
    if (
        node &&
        node.offsetParent &&
        node.offsetParent.offsetWidth &&
        node.offsetParent.offsetWidth > 0
    ) {
        const {offsetParent} = node
        const style = el.ownerDocument.defaultView.getComputedStyle(
            offsetParent,
        )
        let width = offsetParent.clientWidth - IMAGE_MARGIN * 2
        if (style.boxSizing === "border-box") {
            const pl = parseInt(style.paddingLeft, 10)
            const pr = parseInt(style.paddingRight, 10)
            width -= pl + pr
        }
        return Math.max(width, MIN_SIZE)
    }
    // Let the image resize freely.
    return MAX_SIZE
}

function resolveURL(
    runtime: EditorRuntime | null | undefined,
    src: string | null | undefined,
): string | null | undefined {
    if (!runtime) {
        return src
    }
    const {canProxyImageSrc, getProxyImageSrc} = runtime
    if (src && canProxyImageSrc && getProxyImageSrc && canProxyImageSrc(src)) {
        return getProxyImageSrc(src)
    }
    return src
}

class ImageViewBody extends React.Component<NodeViewProps, any> {

    _body = null
    _id = uuid()
    _inlineEditor: any = null
    _mounted = false

    state = {
        maxSize: {
            width: MAX_SIZE,
            height: MAX_SIZE,
            complete: false,
        },
        originalSize: DEFAULT_ORIGINAL_SIZE,
    }

    componentDidMount(): void {
        this._mounted = true
        this._resolveOriginalSize()
        this._renderInlineEditor()
    }

    componentWillUnmount(): void {
        this._mounted = false
        this._inlineEditor && this._inlineEditor?.close()
        this._inlineEditor = null
    }

    componentDidUpdate(prevProps: NodeViewProps): void {
        const prevSrc = prevProps.node.attrs.src
        const {node} = this.props
        const {src} = node.attrs
        if (prevSrc !== src) {
            // A new image is provided, resolve it.
            this._resolveOriginalSize()
        }
        this._renderInlineEditor()
    }

    render() {
        const {originalSize, maxSize} = this.state
        const {editorView, node, selected, focused} = this.props
        // @ts-ignore
        const {readOnly} = editorView
        const {attrs} = node
        const {align, crop, rotate, alt, title} = attrs

        // It"s only active when the image"s fully loaded.
        const loading = originalSize === DEFAULT_ORIGINAL_SIZE
        const active = !loading && focused && !readOnly && originalSize.complete
        const src = originalSize.complete ? originalSize.src : EMPTY_SRC
        const aspectRatio = loading ? 1 : originalSize.width / originalSize.height
        const error = !loading && !originalSize.complete

        let {width, height} = attrs

        if (loading) {
            width = width || IMAGE_PLACEHOLDER_SIZE
            height = height || IMAGE_PLACEHOLDER_SIZE
        }

        if (width && !height) {
            height = width / aspectRatio
        } else if (height && !width) {
            width = height * aspectRatio
        } else if (!width && !height) {
            width = originalSize.width
            height = originalSize.height
        }

        let scale = 1
        if (width > maxSize.width && (!crop || crop.width > maxSize.width)) {
            // Scale image to fit its containing space.
            // If the image is not cropped.
            width = maxSize.width
            height = width / aspectRatio
            scale = maxSize.width / width
        }

        const className = cx(prefixed("image-view-body"), {
            active,
            error,
            focused,
            loading,
            selected,
        })

        const resizeBox =
            active && !crop && !rotate ? (
                <ImageResizeBox
                    height={height}
                    onResizeEnd={this._onResizeEnd}
                    src={src}
                    width={width}
                    alt={alt}
                    title={title}
                />
            ) : null

        const imageStyle: any = {
            display: "inline-block",
            height: height + "px",
            left: "0",
            top: "0",
            width: width + "px",
            position: "relative",
        }

        const clipStyle: any = {}
        if (crop) {
            const cropped = {...crop}
            if (scale !== 1) {
                scale = maxSize.width / cropped.width
                cropped.width *= scale
                cropped.height *= scale
                cropped.left *= scale
                cropped.top *= scale
            }
            clipStyle.width = cropped.width + "px"
            clipStyle.height = cropped.height + "px"
            imageStyle.left = cropped.left + "px"
            imageStyle.top = cropped.top + "px"
        }

        if (rotate) {
            clipStyle.transform = `rotate(${rotate}rad)`
        }

        const errorView = error ? Icon.get("error") : null
        const errorTitle = error
            ? `Unable to load image from ${attrs.src || ""}`
            : undefined

        return (
            <span
                role="presentation"
                className={className}
                data-active={active ? "true" : undefined}
                data-original-src={String(attrs.src)}
                id={this._id}
                onKeyDown={this._onKeyDown}
                ref={this._onBodyRef}
                title={errorTitle}
            >
                <span
                    className={prefixed("image-view-body-img-clip")}
                    style={clipStyle}
                >
                    <span style={imageStyle}>
                        <img
                            alt={alt || ""}
                            className={prefixed("image-view-body-img")}
                            data-align={align}
                            height={height}
                            id={`${this._id}-img`}
                            title={title}
                            src={src}
                            width={width}
                        />
                        {errorView}
                    </span>
                </span>
                {resizeBox}
            </span>
        )
    }

    _renderInlineEditor(): void {
        const el = document.getElementById(this._id)
        if (!el || el.getAttribute("data-active") !== "true") {
            this._inlineEditor && this._inlineEditor.close()
            return
        }

        const {node} = this.props
        const editorProps = {
            value: node.attrs,
            onSelect: this._onChange,
        }
        if (this._inlineEditor) {
            this._inlineEditor.update(editorProps)
        } else {
            this._inlineEditor = createPopUp(ImageInlineEditor, editorProps, {
                anchor: el,
                autoDismiss: false,
                container: this.props.editorView.frameset,
                position: atAnchorBottomCenter,
                onClose: () => {
                    this._inlineEditor = null
                },
            })
        }
    }

    async _resolveOriginalSize(): Promise<void> {
        if (!this._mounted) {
            // unmounted;
            return
        }

        this.setState({originalSize: DEFAULT_ORIGINAL_SIZE})
        const src = this.props.node.attrs.src
        // @ts-ignore
        const url = resolveURL(this.props.editorView.runtime, src)
        const originalSize = await resolveImage(url)

        if (this._mounted && this.props.node.attrs.src === src) {
            this.setState({ originalSize })
        }

    }

    _onKeyDown = (e: any): void => {
        console.log(e.keyCode)
    }

    _onResizeEnd = (width: number, height: number): void => {
        const {getPos, node, editorView} = this.props
        const pos = getPos()
        const attrs = {
            ...node.attrs,
            // TODO: Support UI for cropping later.
            crop: null,
            width,
            height,
        }

        let tr = editorView.state.tr
        const {selection} = editorView.state
        tr = tr.setNodeMarkup(pos, undefined, attrs)
        // [FS] IRAD-1005 2020-07-09
        // Upgrade outdated packages.
        // reset selection to original using the latest doc.
        const origSelection = NodeSelection.create(tr.doc, selection.from)
        tr = tr.setSelection(origSelection)
        editorView.dispatch(tr)
    }

    _onChange = (
        value: {align: string | null | undefined} | null | undefined,
    ): void => {
        if (!this._mounted) {
            return
        }

        const align = value ? value.align : null
        const {getPos, node, editorView} = this.props
        const pos = getPos()
        const attrs = {
            ...node.attrs,
            align,
        }

        let tr = editorView.state.tr
        const {selection} = editorView.state
        tr = tr.setNodeMarkup(pos, undefined, attrs)
        // [FS] IRAD-1005 2020-07-09
        // Upgrade outdated packages.
        // reset selection to original using the latest doc.
        const origSelection = NodeSelection.create(tr.doc, selection.from)
        tr = tr.setSelection(origSelection)
        editorView.dispatch(tr)
    }

    _onBodyRef = (ref: any): void => {
        if (ref) {
            this._body = ref
            // Mounting
            const el = ReactDOM.findDOMNode(ref)
            if (el instanceof HTMLElement) {
                ResizeObserver.observe(el, this._onBodyResize)
            }
        } else {
            // Unmounting.
            const el: any = this._body && ReactDOM.findDOMNode(this._body)
            if (el) {
                ResizeObserver.unobserve(el)
            }
            this._body = null
        }
    }

    _onBodyResize = (info: ResizeObserverEntry): void => {
        const width = this._body
            ? getMaxResizeWidth(ReactDOM.findDOMNode(this._body))
            : MAX_SIZE

        this.setState({
            maxSize: {
                width,
                height: MAX_SIZE,
                complete: !!this._body,
            },
        })
    }
}

class ImageNodeView extends CustomNodeView {
    // @override
    createDOMElement(): HTMLElement {
        const el = document.createElement("span")
        el.className = prefixed("image-view")
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
        return <ImageViewBody {...this.props} />
    }

    _updateDOM(el: HTMLElement): void {
        const {align} = this.props.node.attrs
        let className = prefixed("image-view")
        if (align) {
            className += " align-" + align
        }
        el.className = className
    }
}

export default ImageNodeView
