// eslint-disable-next-line no-unused-vars
import React from "react"

import * as EditorCommands from "@editor/EditorCommands"
import FontSizeCommandMenuButton from "@editor/ui/FontSizeCommandMenuButton"
import FontTypeCommandMenuButton from "@editor/ui/FontTypeCommandMenuButton"
import HeadingCommandMenuButton from "@editor/ui/HeadingCommandMenuButton"
import Icon from "@editor/ui/Icon"

const ICON_LABEL_PATTERN = /\[([A-Za-z_\d]+)\](.*)/

interface ParsedIcon {
  icon?: null | React.ReactNode
  title?: null | string
}

export function parseLabel(input: string): ParsedIcon {
  const matched = input.match(ICON_LABEL_PATTERN)
  if (matched) {
    const [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      all,
      icon,
      label,
    ] = matched
    return {
      icon: icon ? Icon.get(icon) : null,
      title: label || null,
    }
  }
  return {
    icon: null,
    title: input || null,
  }
}

const {
  // [FS][07-MAY-2020][IRAD-956]
  BLOCKQUOTE_TOGGLE,
  CLEAR_FORMAT,
  // DOC_LAYOUT,
  EM,
  HISTORY_REDO,
  HISTORY_UNDO,
  HR,
  IMAGE_FROM_URL,
  IMAGE_UPLOAD,
  INDENT_LESS,
  INDENT_MORE,
  LINK_SET_URL,
  EMBED_SET_URL,
  MATH_EDIT,
  OL,
  STRIKE,
  STRONG,
  SUPER,
  SUB,
  TABLE_ADD_COLUMN_AFTER,
  TABLE_ADD_COLUMN_BEFORE,
  TABLE_ADD_ROW_AFTER,
  TABLE_ADD_ROW_BEFORE,
  TABLE_BORDER_COLOR,
  TABLE_BACKGROUND_COLOR,
  TABLE_DELETE_COLUMN,
  TABLE_DELETE_ROW,
  TABLE_DELETE_TABLE,
  TABLE_INSERT_TABLE,
  TABLE_MERGE_CELLS,
  // TABLE_MOVE_TO_NEXT_CELL,
  // TABLE_MOVE_TO_PREV_CELL,
  TABLE_SPLIT_ROW,
  TABLE_TOGGLE_HEADER_CELL,
  TABLE_TOGGLE_HEADER_COLUMN,
  TABLE_TOGGLE_HEADER_ROW,
  TEXT_ALIGN_CENTER,
  TEXT_ALIGN_JUSTIFY,
  TEXT_ALIGN_LEFT,
  TEXT_ALIGN_RIGHT,
  TEXT_COLOR,
  TEXT_HIGHLIGHT,
  TEXT_LINE_SPACINGS,
  UL,
  UNDERLINE,
} = EditorCommands

export const TABLE_COMMANDS_GROUP = [
  {
    "Insert Table...": TABLE_INSERT_TABLE,
  },
  {
    "Fill Color...": TABLE_BACKGROUND_COLOR,
    "Border Color....": TABLE_BORDER_COLOR,
  },
  {
    "Insert Column Before": TABLE_ADD_COLUMN_BEFORE,
    "Insert Column After": TABLE_ADD_COLUMN_AFTER,
    "Delete Column": TABLE_DELETE_COLUMN,
  },
  {
    "Insert Row Before": TABLE_ADD_ROW_BEFORE,
    "Insert Row After": TABLE_ADD_ROW_AFTER,
    "Delete Row": TABLE_DELETE_ROW,
  },
  {
    "Merge Cells": TABLE_MERGE_CELLS,
    "Split Row": TABLE_SPLIT_ROW,
  }, // Disable these commands cause user rarely use them.
  {
    "Toggle Header Column": TABLE_TOGGLE_HEADER_COLUMN,
    "Toggle Header Row": TABLE_TOGGLE_HEADER_ROW,
    "Toggle Header Cells": TABLE_TOGGLE_HEADER_CELL,
  },
  {
    "Delete Table": TABLE_DELETE_TABLE,
  },
]

// [FS] IRAD-1012 2020-07-14
// Fix: Toolbar is poorly organized.
export type CMD_GROUP_COMMAND_T = {
  [label: string]: any
}

export type COMMAND_GROUPS_T = Array<CMD_GROUP_COMMAND_T>

export const COMMAND_GROUPS: COMMAND_GROUPS_T = [
  {
    "[font_download] Font Type": FontTypeCommandMenuButton,
  },
  {
    "[format_size] Text Size": FontSizeCommandMenuButton,
  },
  {
    "[format_bold] Bold": STRONG,
    "[format_italic] Italic": EM,
    "[format_underline] Underline": UNDERLINE,
    "[format_strikethrough] Strike through": STRIKE,
    "[subscript] Subscript": SUB,
    "[superscript] Superscript": SUPER,
    "[format_color_text] Text color": TEXT_COLOR,
    "[border_color] Highlight color": TEXT_HIGHLIGHT,
    "[format_clear] Clear formats": CLEAR_FORMAT,
  },
  {
    "[format_align_left] Left align": TEXT_ALIGN_LEFT,
    "[format_align_center] Center Align": TEXT_ALIGN_CENTER,
    "[format_align_right] Right Align": TEXT_ALIGN_RIGHT,
    "[format_align_justify] Justify": TEXT_ALIGN_JUSTIFY,
  },
  {
    "[format_indent_increase] Indent more": INDENT_MORE,
    "[format_indent_decrease] Indent less": INDENT_LESS,
    "[format_line_spacing] Line spacing": TEXT_LINE_SPACINGS,
  },
  {
    "[format_list_numbered] Ordered list": OL,
    "[format_list_bulleted] Bulleted list": UL,
  }, // [FS] IRAD-1042 2020-09-09
  // Changes the menu for include the custom styles.
  {
    "[H1] Header 1": HeadingCommandMenuButton,
  },
  {
    "[video_library] Insert video": EMBED_SET_URL,
    "[link] Apply link": LINK_SET_URL,
    "[image] Insert image": [
      {
        "Insert image by URL": IMAGE_FROM_URL,
        "Upload image from computer": IMAGE_UPLOAD,
      },
    ],
    "[grid_on] Table...": TABLE_COMMANDS_GROUP,
    "[hr] Horizontal line": HR,
    "[functions] Math": MATH_EDIT,

    // [FS][07-MAY-2020][IRAD-956]
    "[format_quote] Block quote": BLOCKQUOTE_TOGGLE,
  },
  {
    "[undo] Undo": HISTORY_UNDO,
    "[redo] Redo": HISTORY_REDO,
  },
]
