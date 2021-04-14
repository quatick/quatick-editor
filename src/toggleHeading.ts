import { Schema } from "prosemirror-model"
import { Transaction } from "prosemirror-state"
import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH } from "app/core/components/Editor/src/NodeNames"
import compareNumber from "app/core/components/Editor/src/compareNumber"
import isInsideListItem from "app/core/components/Editor/src/isInsideListItem"
import isListNode from "app/core/components/Editor/src/isListNode"
import { clearMarks } from "app/core/components/Editor/src/clearMarks"
import { unwrapNodesFromList } from "app/core/components/Editor/src/toggleList"

export default function toggleHeading(
    tr: Transaction,
    schema: Schema,
    level: number,
): Transaction {
    const {nodes} = schema
    const {selection, doc} = tr

    const blockquote = nodes[BLOCKQUOTE]
    const heading = nodes[HEADING]
    const listItem = nodes[LIST_ITEM]
    const paragraph = nodes[PARAGRAPH]

    if (
        !selection ||
        !doc ||
        !heading ||
        !paragraph ||
        !listItem ||
        !blockquote
    ) {
        return tr
    }

    const {from, to} = tr.selection
    let startWithHeadingBlock: any = null
    const poses: Array<any> = []
    doc.nodesBetween(from, to, (node, pos, parentNode) => {
        const nodeType = node.type
        const parentNodeType = parentNode.type

        if (startWithHeadingBlock === null) {
            startWithHeadingBlock =
                nodeType === heading && node.attrs.level === level
        }

        if (parentNodeType !== listItem) {
            poses.push(pos)
        }
        return !isListNode(node)
    })
    // Update from the bottom to avoid disruptive changes in pos.
    poses
        .sort(compareNumber)
        .reverse()
        .forEach(pos => {
            tr = setHeadingNode(
                tr,
                schema,
                pos,
                startWithHeadingBlock ? null : level,
            )
        })
    return tr
}

function setHeadingNode(
    tr: Transaction,
    schema: Schema,
    pos: number,
    level: number | null | undefined,
): Transaction {
    const {nodes} = schema
    const heading = nodes[HEADING]
    const paragraph = nodes[PARAGRAPH]
    const blockquote = nodes[BLOCKQUOTE]
    if (pos >= tr.doc.content.size) {
        // Workaround to handle the edge case that pos was shifted caused by `toggleList`.
        return tr
    }
    const node = tr.doc.nodeAt(pos)
    if (!node || !heading || !paragraph || !blockquote) {
        return tr
    }
    const nodeType = node.type
    if (isInsideListItem(tr.doc, pos)) {
        return tr
    } else if (isListNode(node)) {
        // Toggle list
        if (heading && level !== null) {
            tr = unwrapNodesFromList(tr, schema, pos, paragraphNode => {
                const {content, marks, attrs} = paragraphNode
                const headingAttrs = {...attrs, level}
                return heading.create(headingAttrs, content, marks)
            })
        }
    } else if (nodeType === heading) {
        // Toggle heading
        if (level === null) {
            tr = tr.setNodeMarkup(pos, paragraph, node.attrs, node.marks)
        } else {
            tr = tr.setNodeMarkup(
                pos,
                heading,
                {...node.attrs, level},
                node.marks,
            )
        }
    } else if ((level && nodeType === paragraph) || nodeType === blockquote) {
        // [FS] IRAD-948 2020-05-22
        // Clear Header formatting
        tr = clearMarks(tr, schema)
        tr = tr.setNodeMarkup(pos, heading, {...node.attrs, level}, node.marks)
    }
    return tr
}
