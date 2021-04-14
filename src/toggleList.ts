import consolidateListNodes from "app/core/components/Editor/src/consolidateListNodes"
import compareNumber from "app/core/components/Editor/src/compareNumber"
import nullthrows from "nullthrows"
import {Fragment, Node, NodeType, Schema} from "prosemirror-model"
import {TextSelection, Transaction} from "prosemirror-state"
import {findParentNodeOfType} from "prosemirror-utils"

import {HEADING, LIST_ITEM, PARAGRAPH} from "app/core/components/Editor/src/NodeNames"
import isListNode from "app/core/components/Editor/src/isListNode"
import transformAndPreserveTextSelection from "app/core/components/Editor/src/transformAndPreserveTextSelection"

import {SelectionMemo} from "app/core/components/Editor/src/transformAndPreserveTextSelection"

export default function toggleList(
    tr: Transaction,
    schema: Schema,
    listNodeType: NodeType,
): Transaction {
    const {selection, doc} = tr
    if (!selection || !doc) {
        return tr
    }

    // [FS][04-AUG-2020][IRAD-955]
    // Fix Unable to apply list using Ctrl+A selection
    let {from} = selection
    const {to} = selection
    let newselection: TextSelection<any> | null = null

    if (from === 0) {
        from = 1
        newselection = TextSelection.create(doc, from, to)
        tr = tr.setSelection(newselection)
    }

    const fromSelection = TextSelection.create(doc, from, from)
    const paragraph = schema.nodes[PARAGRAPH]
    const heading = schema.nodes[HEADING]
    const result = findParentNodeOfType(listNodeType)(fromSelection)
    const p = findParentNodeOfType(paragraph)(fromSelection)
    const h = findParentNodeOfType(heading)(fromSelection)

    if (result) {
        tr = unwrapNodesFromList(tr, schema, result.pos)
    } else if (paragraph && p) {
        tr = wrapNodesWithList(tr, schema, listNodeType, newselection)
    } else if (heading && h) {
        tr = wrapNodesWithList(tr, schema, listNodeType, newselection)
    }
    return tr
}

export function unwrapNodesFromList(
    tr: Transaction,
    schema: Schema,
    listNodePos: number,
    unwrapParagraphNode?: (arg0: Node) => Node | null | undefined,
): Transaction {
    return transformAndPreserveTextSelection(tr, schema, memo => {
        return consolidateListNodes(
            unwrapNodesFromListInternal(memo, listNodePos, unwrapParagraphNode),
        )
    })
}

function wrapNodesWithList(
    tr: Transaction,
    schema: Schema,
    listNodeType: NodeType,
    newselection: TextSelection<any> | null = null,
): Transaction {
    return transformAndPreserveTextSelection(tr, schema, memo => {
        // [FS][04-AUG-2020][IRAD-955]
        // Fix Unable to apply list using Ctrl+A selection
        return consolidateListNodes(
            wrapNodesWithListInternal(memo, listNodeType, newselection),
        )
    })
}

function wrapNodesWithListInternal(
    memo: SelectionMemo,
    listNodeType: NodeType,
    newselection: any = null,
): Transaction {
    const {schema} = memo
    let {tr} = memo
    const {doc, selection} = tr
    let {from, to} = selection
    if (!tr || !selection) {
        return tr
    }
    if (newselection) {
        from = newselection.from
        to = newselection.to
    }

    const paragraph = schema.nodes[PARAGRAPH]
    const heading = schema.nodes[HEADING]

    let items: any = null
    let lists: Array<any> = []
    doc.nodesBetween(from, to, (node, pos) => {
        const nodeType = node.type
        const nodeName = nodeType.name
        if (isListNode(node)) {
            if (node.type !== listNodeType) {
                const listNodeAttrs = {
                    ...node.attrs,
                    listNodeType: null,
                }
                tr = tr.setNodeMarkup(
                    pos,
                    listNodeType,
                    listNodeAttrs,
                    node.marks,
                )
            }
            items && lists.push(items)
            items = null
            return false
        }

        if (/table/.test(nodeName)) {
            items && lists.push(items)
            items = null
            return true
        }

        if (nodeType === heading || nodeType === paragraph) {
            items = items || []
            items.push({node, pos})
        } else {
            items && items.length && lists.push(items)
            items = null
        }
        return true
    })
    items && items.length && lists.push(items)

    lists = lists.filter(items => items && items.length > 0)
    if (!lists.length) {
        return tr
    }

    lists = lists.sort((a, b) => {
        const pa = nullthrows(a[0]).pos
        const pb = nullthrows(b[0]).pos
        return pa >= pb ? 1 : -1
    })

    lists.reverse()

    lists.forEach(items => {
        tr = wrapItemsWithListInternal(tr, schema, listNodeType, items)
    })

    return tr
}

function wrapItemsWithListInternal(
    tr: Transaction,
    schema: Schema,
    listNodeType: NodeType,
    items: Array<{node: Node; pos: number}>,
): Transaction {
    const initialTr = tr
    const paragraph = schema.nodes[PARAGRAPH]
    const listItem = schema.nodes[LIST_ITEM]

    if (!paragraph || !listItem) {
        return tr
    }

    const paragraphNodes: Array<any> = []
    items.forEach(item => {
        const {node, pos} = item
        // Temporarily annotate each node with an unique ID.
        const uniqueID = {}
        const nodeAttrs = {...node.attrs, id: uniqueID}
        // Replace the original node with the node annotated by the uniqueID.
        tr = tr.setNodeMarkup(pos, paragraph, nodeAttrs, node.marks)
        paragraphNodes.push(tr.doc.nodeAt(pos))
    })

    const firstNode: any = paragraphNodes[0]
    const lastNode: any = paragraphNodes[paragraphNodes.length - 1]
    if (!firstNode || !lastNode) {
        return initialTr
    }

    const firstNodeID = firstNode.attrs.id
    const lastNodeID = lastNode.attrs.id
    if (!firstNodeID || !lastNodeID) {
        return initialTr
    }

    let fromPos: any = null
    let toPos: any = null
    tr.doc.descendants((node, pos) => {
        const nodeID = node.attrs.id
        if (nodeID === firstNodeID) {
            fromPos = pos
        }
        if (nodeID === lastNodeID) {
            toPos = pos + node.nodeSize
        }
        return fromPos === null || toPos === null
    })

    if (fromPos === null || toPos === null) {
        return initialTr
    }

    const listItemNodes: Array<any> = []
    items.forEach(item => {
        const {node} = item
        // Restore the annotated nodes with the copy of the original ones.
        const paragraphNode = paragraph.create(
            node.attrs,
            node.content,
            node.marks,
        )
        const listItemNode = listItem.create(
            node.attrs,
            Fragment.from(paragraphNode),
        )
        listItemNodes.push(listItemNode)
    })

    const listNodeAttrs = {indent: 0, start: 1}
    const $fromPos = tr.doc.resolve(fromPos)
    const $toPos = tr.doc.resolve(toPos)

    const hasSameListNodeBefore =
        $fromPos.nodeBefore &&
        $fromPos.nodeBefore.type === listNodeType &&
        $fromPos.nodeBefore.attrs.indent === 0

    const hasSameListNodeAfter =
        $toPos.nodeAfter &&
        $toPos.nodeAfter.type === listNodeType &&
        $toPos.nodeAfter.attrs.indent === 0

    if (hasSameListNodeBefore) {
        tr = tr.delete(fromPos, toPos)
        tr = tr.insert(fromPos - 1, Fragment.from(listItemNodes))
        if (hasSameListNodeAfter) {
            tr = tr.delete(toPos + 1, toPos + 3)
        }
    } else if (hasSameListNodeAfter) {
        tr = tr.delete(fromPos, toPos)
        tr = tr.insert(fromPos + 1, Fragment.from(listItemNodes))
    } else {
        const listNode = listNodeType.create(
            listNodeAttrs,
            Fragment.from(listItemNodes),
        )
        tr = tr.delete(fromPos, toPos)
        tr = tr.insert(fromPos, Fragment.from(listNode))
    }

    return tr
}

// [FS] IRAD-966 2020-05-20
// Fix: Toggling issue for Multi-level list.

function unwrapNodesFromSelection(
    tr: Transaction,
    listNodePos: number,
    nodes: Node,
    unwrapParagraphNode?: Node,
    from?: number,
    to?: number,
): Transaction {
    const contentBlocksBefore: Array<{
        node: Node<any>;
        pos: number;
        parentNode: Node<any>;
        index: number;
    }> = []
    const contentBlocksSelected: Array<{
        node: Node<any>;
        pos: number;
        parentNode: Node<any>;
        index: number;
    }> = []
    const contentBlocksAfter: Array<{
        node: Node<any>;
        pos: number;
        parentNode: Node<any>;
        index: number;
    }> = []
    const paragraph = nodes[PARAGRAPH]
    const listItem = nodes[LIST_ITEM]
    const listNode: any = tr.doc.nodeAt(listNodePos)

    tr.doc.nodesBetween(
        listNodePos,
        listNodePos + listNode.nodeSize,
        (node, pos, parentNode, index) => {
            if (node.type !== paragraph) {
                return true
            }
            const block = {
                node,
                pos,
                parentNode,
                index,
            }

            if (from && pos + node.nodeSize <= from) {
                contentBlocksBefore.push(block)
            } else if (to && pos > to) {
                contentBlocksAfter.push(block)
            } else {
                contentBlocksSelected.push(block)
            }
            return false
        },
    )

    if (!contentBlocksSelected.length) {
        return tr
    }

    tr = tr.delete(listNodePos, listNodePos + listNode.nodeSize)

    const listNodeType = listNode.type
    const attrs = {indent: listNode.attrs.indent, start: 1}

    if (contentBlocksAfter.length) {
        const nodes = contentBlocksAfter.map(block => {
            return listItem.create({}, Fragment.from(block.node))
        })
        const frag = Fragment.from(
            listNodeType.create(attrs, Fragment.from(nodes)),
        )
        tr = tr.insert(listNodePos, frag)
    }

    if (contentBlocksSelected.length) {
        const nodes = contentBlocksSelected.map(block => {
            if (unwrapParagraphNode) {
                // @ts-ignore
                return unwrapParagraphNode(block.node)
            } else {
                return block.node
            }
        })
        const frag = Fragment.from(nodes)
        tr = tr.insert(listNodePos, frag)
    }

    if (contentBlocksBefore.length) {
        const nodes = contentBlocksBefore.map(block => {
            return listItem.create({}, Fragment.from(block.node))
        })
        const frag = Fragment.from(
            listNodeType.create(attrs, Fragment.from(nodes)),
        )
        tr = tr.insert(listNodePos, frag)
    }

    return tr
}

function unwrapNodesFromListInternal(
    memo: SelectionMemo,
    listNodePos: number,
    unwrapParagraphNode?: (arg0: Node) => Node | null | undefined,
): Transaction {
    const {schema} = memo
    let {tr} = memo

    if (!tr.doc || !tr.selection) {
        return tr
    }

    const {nodes} = schema
    const paragraph = nodes[PARAGRAPH]
    const listItem = nodes[LIST_ITEM]

    if (!listItem || !paragraph) {
        return tr
    }

    const listNode = tr.doc.nodeAt(listNodePos)
    if (listNode && !isListNode(listNode)) {
        return tr
    }

    const initialSelection = tr.selection
    const {from, to} = initialSelection

    const listNodePoses: Array<number> = []

    // keep all list type nodes starting position
    tr.doc.nodesBetween(from, to, (node, pos) => {
        if (isListNode(node)) {
            listNodePoses.push(pos)
        }
    })

    if (from === to && from < 1) {
        return tr
    }
    // Unwraps all selected list
    listNodePoses
        .sort(compareNumber)
        .reverse()
        .forEach(pos => {
            tr = unwrapNodesFromSelection(
                tr,
                pos,
                // @ts-ignore
                nodes,
                unwrapParagraphNode,
                from,
                to,
            )
        })

    return tr
}
