import { Schema } from "prosemirror-model"
import BlockquoteNodeSpec from "@editor/BlockquoteNodeSpec"
import BookmarkNodeSpec from "@editor/ui/bookmark/BookmarkNodeSpec"
import BulletListNodeSpec from "@editor/BulletListNodeSpec"
import DocNodeSpec from "@editor/DocNodeSpec"
import HardBreakNodeSpec from "@editor/HardBreakNodeSpec"
import HeadingNodeSpec from "@editor/HeadingNodeSpec"
import HorizontalRuleNodeSpec from "@editor/HorizontalRuleNodeSpec"
import ImageNodeSpec from "@editor/ImageNodeSpec"
import ListItemNodeSpec from "@editor/ListItemNodeSpec"
import MathNodeSpec from "@editor/MathNodeSpec"
import EmbedNodeSpec from "@editor/EmbedNodeSpec"
import * as NodeNames from "@editor/NodeNames"
import OrderedListNodeSpec from "@editor/OrderedListNodeSpec"
import ParagraphNodeSpec from "@editor/ParagraphNodeSpec"
import TableNodesSpecs from "@editor/TableNodesSpecs"
import TextNodeSpec from "@editor/TextNodeSpec"

const {
    BLOCKQUOTE,
    BOOKMARK,
    BULLET_LIST,
    //CODE_BLOCK,
    DOC,
    HARD_BREAK,
    HEADING,
    HORIZONTAL_RULE,
    IMAGE,
    LIST_ITEM,
    MATH,
    EMBED,
    ORDERED_LIST,
    PARAGRAPH,
    TEXT,
} = NodeNames

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js

// !! Be careful with the order of these nodes, which may effect the parsing
// outcome.!!
const nodes = {
    [DOC]: DocNodeSpec,
    [PARAGRAPH]: ParagraphNodeSpec,
    [BLOCKQUOTE]: BlockquoteNodeSpec,
    [HORIZONTAL_RULE]: HorizontalRuleNodeSpec,
    [HEADING]: HeadingNodeSpec,
    [TEXT]: TextNodeSpec,
    [IMAGE]: ImageNodeSpec,
    [MATH]: MathNodeSpec,
    [HARD_BREAK]: HardBreakNodeSpec,
    [BULLET_LIST]: BulletListNodeSpec,
    [ORDERED_LIST]: OrderedListNodeSpec,
    [LIST_ITEM]: ListItemNodeSpec,
    [BOOKMARK]: BookmarkNodeSpec,
    [EMBED]: EmbedNodeSpec,
}

const marks = {}
// @ts-ignore
const schema = new Schema({nodes, marks})
// @ts-ignore
const EditorNodes = schema.spec.nodes.append(TableNodesSpecs)

export default EditorNodes
