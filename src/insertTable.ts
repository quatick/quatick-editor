import {Fragment, Schema} from "prosemirror-model"
import {TextSelection, Transaction} from "prosemirror-state"

import {PARAGRAPH, TABLE, TABLE_CELL, TABLE_ROW} from "app/core/components/Editor/src/NodeNames"

// const ZERO_WIDTH_SPACE_CHAR = "\u200b";

export default function insertTable(
    tr: Transaction,
    schema: Schema,
    rows: number,
    cols: number,
): Transaction {
    if (!tr.selection || !tr.doc) {
        return tr
    }
    const {from, to} = tr.selection
    if (from !== to) {
        return tr
    }

    const {nodes} = schema
    const cell = nodes[TABLE_CELL]
    const paragraph = nodes[PARAGRAPH]
    const row = nodes[TABLE_ROW]
    const table = nodes[TABLE]
    if (!(cell && paragraph && row && table)) {
        return tr
    }

    const rowNodes: any = []
    for (let rr = 0; rr < rows; rr++) {
        const cellNodes: any = []
        for (let cc = 0; cc < cols; cc++) {
            // [FS] IRAD-950 2020-05-25
            // Fix:Extra arrow key required for cell navigation using arrow right/Left
            const cellNode = cell.create(
                undefined,
                Fragment.fromArray([paragraph.create()]),
            )
            cellNodes.push(cellNode)
        }
        const rowNode = row.create({}, Fragment.from(cellNodes))
        rowNodes.push(rowNode)
    }
    const tableNode = table.create({}, Fragment.from(rowNodes))
    tr = tr.insert(from, Fragment.from(tableNode))

    const selection = TextSelection.create(tr.doc, from + 5, from + 5)

    tr = tr.setSelection(selection)
    return tr
}
