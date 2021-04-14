import { Schema } from "prosemirror-model"
import BlockquoteNodeSpec from "app/core/components/Editor/src/BlockquoteNodeSpec"
import BookmarkNodeSpec from "app/core/components/Editor/src/ui/bookmark/BookmarkNodeSpec"
import BulletListNodeSpec from "app/core/components/Editor/src/BulletListNodeSpec"
import DocNodeSpec from "app/core/components/Editor/src/DocNodeSpec"
import HardBreakNodeSpec from "app/core/components/Editor/src/HardBreakNodeSpec"
import HeadingNodeSpec from "app/core/components/Editor/src/HeadingNodeSpec"
import HorizontalRuleNodeSpec from "app/core/components/Editor/src/HorizontalRuleNodeSpec"
import ImageNodeSpec from "app/core/components/Editor/src/ImageNodeSpec"
import ListItemNodeSpec from "app/core/components/Editor/src/ListItemNodeSpec"
import MathNodeSpec from "app/core/components/Editor/src/MathNodeSpec"
import EmbedNodeSpec from "app/core/components/Editor/src/EmbedNodeSpec"
import * as NodeNames from "app/core/components/Editor/src/NodeNames"
import OrderedListNodeSpec from "app/core/components/Editor/src/OrderedListNodeSpec"
import ParagraphNodeSpec from "app/core/components/Editor/src/ParagraphNodeSpec"
import TableNodesSpecs from "app/core/components/Editor/src/TableNodesSpecs"
import TextNodeSpec from "app/core/components/Editor/src/TextNodeSpec"

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
