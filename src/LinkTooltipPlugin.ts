import { EditorState, Plugin, PluginKey } from "prosemirror-state"
import { TextSelection } from "prosemirror-state"

import { MARK_LINK } from "@editor/MarkNames"
import EditorView from "@editor/ui/editor/EditorView"
import {
    hideSelectionPlaceholder,
    showSelectionPlaceholder,
} from "@editor/SelectionPlaceholderPlugin"
import applyMark from "@editor/applyMark"
import findNodesWithSameMark from "@editor/findNodesWithSameMark"
import lookUpElement from "@editor/lookUpElement"
import LinkTooltip from "@editor/ui/LinkTooltip"
import LinkURLEditor from "@editor/ui/LinkURLEditor"
import { atAnchorTopCenter } from "@editor/ui/PopUpPosition"
import createPopUp from "@editor/ui/createPopUp"

// https://prosemirror.net/examples/tooltip/
const SPEC = {
    // [FS] IRAD-1005 2020-07-07
    // Upgrade outdated packages.
    key: new PluginKey("LinkTooltipPlugin"),
    view(editorView: EditorView) {
        return new LinkTooltipView(editorView)
    },
}

class LinkTooltipPlugin extends Plugin {
    constructor() {
        super(SPEC)
    }
}

class LinkTooltipView {
    _anchorEl: any = null
    _popUp: any = null
    _editor: any = null

    constructor(editorView: EditorView) {
        this.update(editorView, null)
    }

    update(view: EditorView, lastState: EditorState | null): void {
        // @ts-ignore
        if (view.readOnly) {
            this.destroy()
            return
        }

        const {state} = view
        const {doc, selection, schema} = state
        const markType = schema.marks[MARK_LINK]
        if (!markType) {
            return
        }
        const {from, to} = selection
        const result = findNodesWithSameMark(doc, from, to, markType)

        if (!result) {
            this.destroy()
            return
        }
        const domFound = view.domAtPos(from)
        if (!domFound) {
            this.destroy()
            return
        }
        const anchorEl = lookUpElement(domFound.node, el => el.nodeName === "A")
        if (!anchorEl) {
            this.destroy()
            return
        }

        const popup = this._popUp
        const viewPops = {
            editorState: state,
            editorView: view,
            href: result?.mark?.attrs.href,
            onCancel: this._onCancel,
            onEdit: this._onEdit,
            onRemove: this._onRemove,
        }

        if (popup && anchorEl === this._anchorEl) {
            popup.update(viewPops)
        } else {
            popup && popup.close(null)
            this._anchorEl = anchorEl
            this._popUp = createPopUp(LinkTooltip, viewPops, {
                anchor: anchorEl,
                autoDismiss: false,
                onClose: this._onClose,
                position: atAnchorTopCenter,
            })
        }
    }

    destroy() {
        this._popUp && this._popUp.close()
        this._editor && this._editor.close()
    }

    _onCancel = (view: EditorView): void => {
        this.destroy()
        view.focus()
    }

    _onClose = (): void => {
        this._anchorEl = null
        this._editor = null
        this._popUp = null
    }

    _onEdit = (view: EditorView): void => {
        if (this._editor) {
            return
        }

        const {state} = view
        const {schema, doc, selection} = state
        const {from, to} = selection
        const markType = schema.marks[MARK_LINK]
        const result = findNodesWithSameMark(doc, from, to, markType)
        if (!result) {
            return
        }
        let {tr} = state
        const linkSelection = TextSelection.create(
            tr.doc,
            result.from.pos,
            result.to.pos + 1,
        )

        tr = tr.setSelection(linkSelection)
        tr = showSelectionPlaceholder(state, tr)
        view.dispatch(tr)

        const href = result ? result?.mark?.attrs.href : null
        this._editor = createPopUp(
            LinkURLEditor,
            {href},
            {
                container: view.frameset,
                onClose: value => {
                    this._editor = null
                    this._onEditEnd(view, selection, value)
                },
            },
        )
    }

    _onRemove = (view: EditorView): void => {
        this._onEditEnd(view, view.state.selection, null)
    }

    _onEditEnd = (
        view: EditorView,
        initialSelection: TextSelection,
        href: string | null | undefined,
    ): void => {
        const {state, dispatch} = view
        let tr = hideSelectionPlaceholder(state)

        if (href !== undefined) {
            const {schema} = state
            const markType = schema.marks[MARK_LINK]
            if (markType) {
                const result = findNodesWithSameMark(
                    tr.doc,
                    initialSelection.from,
                    initialSelection.to,
                    markType,
                )
                if (result) {
                    const linkSelection = TextSelection.create(
                        tr.doc,
                        result.from.pos,
                        result.to.pos + 1,
                    )
                    tr = tr.setSelection(linkSelection)
                    const attrs = href ? {href} : null
                    tr = applyMark(tr, schema, markType, attrs)

                    // [FS] IRAD-1005 2020-07-09
                    // Upgrade outdated packages.
                    // reset selection to original using the latest doc.
                    const origSelection = TextSelection.create(
                        tr.doc,
                        initialSelection.from,
                        initialSelection.to,
                    )
                    tr = tr.setSelection(origSelection)
                }
            }
        }
        dispatch(tr)
        view.focus()
    }
}

export default LinkTooltipPlugin
