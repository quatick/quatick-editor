import {Schema} from "prosemirror-model"
import {AllSelection, EditorState, TextSelection} from "prosemirror-state"
import {Transaction} from "prosemirror-state"
import {EditorView} from "prosemirror-view"

import {BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH} from "@editor/NodeNames"
import UICommand from "@editor/ui/UICommand"

export function setTextAlign(
    tr: Transaction,
    schema: Schema,
    alignment: string | null | undefined,
): Transaction {
    const {selection, doc} = tr
    if (!selection || !doc) {
        return tr
    }
    const {from, to} = selection
    const {nodes} = schema

    const blockquote = nodes[BLOCKQUOTE]
    const listItem = nodes[LIST_ITEM]
    const heading = nodes[HEADING]
    const paragraph = nodes[PARAGRAPH]

    const tasks: any = []
    alignment = alignment || null

    const allowedNodeTypes = new Set([blockquote, heading, listItem, paragraph])

    doc.nodesBetween(from, to, (node, pos, parentNode) => {
        const nodeType = node.type
        const align = node.attrs.align || null
        if (align !== alignment && allowedNodeTypes.has(nodeType)) {
            tasks.push({
                node,
                pos,
                nodeType,
            })
        }
        return true
    })

    if (!tasks.length) {
        return tr
    }

    tasks.forEach(job => {
        const {node, pos, nodeType}: any = job
        let {attrs}: any = node
        if (alignment) {
            attrs = {
                ...attrs,
                align: alignment,
            }
        } else {
            attrs = {
                ...attrs,
                align: null,
            }
        }
        tr = tr.setNodeMarkup(pos, nodeType, attrs, node.marks)
    })

    return tr
}

class TextAlignCommand extends UICommand {
    _alignment: string

    constructor(alignment: string) {
        super()
        this._alignment = alignment
    }

    isActive = (state: EditorState): boolean => {
        const {selection, doc} = state
        const {from, to} = selection
        let keepLooking = true
        let active = false
        doc.nodesBetween(from, to, (node, pos) => {
            if (keepLooking && node.attrs.align === this._alignment) {
                keepLooking = false
                active = true
            }
            return keepLooking
        })
        return active
    }

    isEnabled = (state: EditorState): boolean => {
        const {selection} = state
        return (
            selection instanceof TextSelection ||
            selection instanceof AllSelection
        )
    }

    execute = (
        state: EditorState,
        dispatch: (tr: Transaction) => void | null | undefined,
        view: EditorView | null | undefined,
    ): boolean => {
        const {schema, selection} = state
        const tr = setTextAlign(
            state.tr.setSelection(selection),
            schema,
            this._alignment,
        )
        if (tr.docChanged) {
            dispatch && dispatch(tr)
            return true
        } else {
            return false
        }
    }
}

export default TextAlignCommand
