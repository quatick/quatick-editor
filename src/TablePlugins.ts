import { tableEditing } from "prosemirror-tables"

import TableCellMenuPlugin from "@editor/TableCellMenuPlugin"
import TableResizePlugin from "@editor/TableResizePlugin"

/* Tables
https://github.com/ProseMirror/prosemirror-tables/blob/master/demo.js */
const TablePlugins = [new TableCellMenuPlugin(), new TableResizePlugin(), tableEditing()]
export default TablePlugins
