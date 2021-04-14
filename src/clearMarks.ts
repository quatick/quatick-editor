import { Mark, Schema, Node } from "prosemirror-model"
import { Transaction } from "prosemirror-state"
import { HEADING, PARAGRAPH } from "app/core/components/Editor/src/NodeNames"
import * as MarkNames from "app/core/components/Editor/src/MarkNames"
import { setTextAlign } from "app/core/components/Editor/src/TextAlignCommand"

const {
  MARK_EM,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_STRIKE,
  MARK_STRONG,
  MARK_TEXT_COLOR,
  MARK_TEXT_HIGHLIGHT,
  MARK_UNDERLINE,
  MARK_CUSTOMSTYLES,
} = MarkNames

const FORMAT_MARK_NAMES = [
  MARK_EM,
  MARK_FONT_SIZE,
  MARK_FONT_TYPE,
  MARK_STRIKE,
  MARK_STRONG,
  MARK_TEXT_COLOR,
  MARK_TEXT_HIGHLIGHT,
  MARK_UNDERLINE, // [FS] IRAD-1042 2020-09-18
  // Fix: To clear custom style format.
  MARK_CUSTOMSTYLES,
]

export function clearMarks(tr: Transaction, schema: Schema): Transaction {
  const { doc, selection } = tr
  if (!selection || !doc) {
    return tr
  }
  const { from, to, empty } = selection
  if (empty) {
    return tr
  }

  const markTypesToRemove = new Set(FORMAT_MARK_NAMES.map((n) => schema.marks[n]).filter(Boolean))

  if (!markTypesToRemove.size) {
    return tr
  }

  const tasks: Array<{
    node: Node<any>
    pos: number
    mark: Mark<any>
  }> = []
  doc.nodesBetween(from, to, (node, pos) => {
    if (node.marks && node.marks.length) {
      // eslint-disable-next-line array-callback-return
      node.marks.some((mark) => {
        if (markTypesToRemove.has(mark.type)) {
          tasks.push({ node, pos, mark })
        }
      })
      return true
    }
    return true
  })
  if (!tasks.length) {
    return tr
  }

  tasks.forEach((job) => {
    const { node, mark, pos } = job
    tr = tr.removeMark(pos, pos + node.nodeSize, mark.type)
  })

  // It should also clear text alignment.
  tr = setTextAlign(tr, schema, null)
  return tr
}

// [FS] IRAD-948 2020-05-22
// Clear Header formatting
export function clearHeading(tr: Transaction, schema: Schema) {
  const { doc, selection } = tr

  if (!selection || !doc) {
    return tr
  }
  const { from, to, empty } = selection
  if (empty) {
    return tr
  }
  const { nodes } = schema

  const heading = nodes[HEADING]
  const paragraph = nodes[PARAGRAPH]

  const tasks: Array<{
    node: Node<any>
    pos: number
  }> = []

  doc.nodesBetween(from, to, (node, pos) => {
    if (heading === node.type) {
      tasks.push({ node, pos })
    }
    return true
  })

  if (!tasks.length) {
    return tr
  }

  tasks.forEach((job) => {
    const { node, pos } = job
    tr = tr.setNodeMarkup(pos, paragraph, node.attrs, node.marks)
  })
  return tr
}
