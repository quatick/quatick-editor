import { tableEditing } from "prosemirror-tables"

import TableCellMenuPlugin from "app/core/components/Editor/src/TableCellMenuPlugin"
import TableResizePlugin from "app/core/components/Editor/src/TableResizePlugin"

/* Tables
https://github.com/ProseMirror/prosemirror-tables/blob/master/demo.js */
const TablePlugins = [new TableCellMenuPlugin(), new TableResizePlugin(), tableEditing()]
export default TablePlugins
