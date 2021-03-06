import clamp from "@editor/ui/clamp"
import compareNumber from "@editor/compareNumber"
import consolidateListNodes from "@editor/consolidateListNodes"
import isListNode from "@editor/isListNode"
import transformAndPreserveTextSelection from "@editor/transformAndPreserveTextSelection"
import {AllSelection, TextSelection, Transaction} from "prosemirror-state"
import {BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH} from "@editor/NodeNames"
import {Fragment, Schema, Node} from "prosemirror-model"
import {MAX_INDENT_LEVEL, MIN_INDENT_LEVEL} from "@editor/ParagraphNodeSpec"

export default function updateIndentLevel(
    tr: Transaction,
    schema: Schema,
    delta: number,
): Transaction {
    const {doc, selection} = tr
    if (!doc || !selection) {
        return tr
    }

    if (
        !(
            selection instanceof TextSelection ||
            selection instanceof AllSelection
        )
    ) {
        return tr
    }

    const {nodes} = schema
    const {from, to} = selection
    const listNodePoses: Array<number> = []

    const blockquote = nodes[BLOCKQUOTE]
    const heading = nodes[HEADING]
    const paragraph = nodes[PARAGRAPH]

    doc.nodesBetween(from, to, (node, pos) => {
        const nodeType = node.type
        if (
            nodeType === paragraph ||
            nodeType === heading ||
            nodeType === blockquote
        ) {
            tr = setNodeIndentMarkup(tr, schema, pos, delta)
            return false
        } else if (isListNode(node)) {
            // List is tricky, we"ll handle it later.
            listNodePoses.push(pos)
            return false
        }
        return true
    })

    if (!listNodePoses.length) {
        return tr
    }

    tr = transformAndPreserveTextSelection(tr, schema, memo => {
        const {schema} = memo
        let tr2 = memo.tr
        listNodePoses
            .sort(compareNumber)
            .reverse()
            .forEach(pos => {
                tr2 = setListNodeIndent(tr2, schema, pos, delta)
            })
        tr2 = consolidateListNodes(tr2)
        return tr2
    })

    return tr
}

function setListNodeIndent(
    tr: Transaction,
    schema: Schema,
    pos: number,
    delta: number,
): Transaction {
    const listItem = schema.nodes[LIST_ITEM]
    if (!listItem) {
        return tr
    }

    const {doc, selection} = tr
    if (!doc) {
        return tr
    }

    const listNode = doc.nodeAt(pos)
    if (!listNode) {
        return tr
    }

    const indentNew = clamp(
        MIN_INDENT_LEVEL,
        listNode.attrs.indent + delta,
        MAX_INDENT_LEVEL,
    )
    if (indentNew === listNode.attrs.indent) {
        return tr
    }

    const {from, to} = selection

    // [FS] IRAD-947 2020-05-19
    // Fix for Multi-level lists lose multi-levels when indenting/de-indenting
    // Earlier they checked the to postion value to >= pos + listNode.nodeSize
    // It wont satisfy the list hve childrens

    if (from <= pos && to >= pos) {
        return setNodeIndentMarkup(tr, schema, pos, delta)
    }

    const listNodeType = listNode.type

    // listNode is partially selected.
    const itemsBefore: Array<Node<Schema<any, any>>> = []
    const itemsSelected: Array<Node<Schema<any, any>>> = []
    const itemsAfter: Array<Node<Schema<any, any>>> = []

    doc.nodesBetween(pos, pos + listNode.nodeSize, (itemNode, itemPos) => {
        if (itemNode.type === listNodeType) {
            return true
        }

        if (itemNode.type === listItem) {
            const listItemNode = listItem.create(
                itemNode.attrs,
                itemNode.content,
                itemNode.marks,
            )
            if (itemPos + itemNode.nodeSize <= from) {
                itemsBefore.push(listItemNode)
            } else if (itemPos > to) {
                itemsAfter.push(listItemNode)
            } else {
                itemsSelected.push(listItemNode)
            }
            return false
        }

        return true
    })

    tr = tr.delete(pos, pos + listNode.nodeSize)
    if (itemsAfter.length) {
        const listNodeNew = listNodeType.create(
            listNode.attrs,
            Fragment.from(itemsAfter),
        )
        tr = tr.insert(pos, Fragment.from(listNodeNew))
    }

    if (itemsSelected.length) {
        const listNodeAttrs = {
            ...listNode.attrs,
            indent: indentNew,
        }
        const listNodeNew = listNodeType.create(
            listNodeAttrs,
            Fragment.from(itemsSelected),
        )
        tr = tr.insert(pos, Fragment.from(listNodeNew))
    }

    if (itemsBefore.length) {
        const listNodeNew = listNodeType.create(
            listNode.attrs,
            Fragment.from(itemsBefore),
        )
        tr = tr.insert(pos, Fragment.from(listNodeNew))
    }

    return tr
}

function setNodeIndentMarkup(
    tr: Transaction,
    schema: Schema,
    pos: number,
    delta: number,
): Transaction {
    if (!tr.doc) {
        return tr
    }
    const node = tr.doc.nodeAt(pos)
    if (!node) {
        return tr
    }
    const indent = clamp(
        MIN_INDENT_LEVEL,
        (node.attrs.indent || 0) + delta,
        MAX_INDENT_LEVEL,
    )
    if (indent === node.attrs.indent) {
        return tr
    }
    const nodeAttrs = {
        ...node.attrs,
        indent,
    }
    return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks)
}
