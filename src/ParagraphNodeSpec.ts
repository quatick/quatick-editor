import clamp from "@editor/ui/clamp"
import convertToCSSPTValue from "@editor/convertToCSSPTValue"
import toCSSLineSpacing from "@editor/ui/toCSSLineSpacing"
import {Node} from "prosemirror-model"

import {NodeSpec} from "@editor/Types"
import {prefixed} from "@editor/util"
// This assumes that every 36pt maps to one indent level.
export const INDENT_MARGIN_PT_SIZE = 36
export const MIN_INDENT_LEVEL = 0
export const MAX_INDENT_LEVEL = 7
export const ATTRIBUTE_INDENT = "data-indent"
const cssVal = new Set<string>(["", "0%", "0pt", "0px"])

export const EMPTY_CSS_VALUE = cssVal

const ALIGN_PATTERN = /(left|right|center|justify)/

// https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.js
// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
const ParagraphNodeSpec: NodeSpec = {
    attrs: {
        align: {default: null},
        color: {default: null},
        id: {default: null},
        indent: {default: null},
        lineSpacing: {default: null},
        // TODO: Add UI to let user edit / clear padding.
        paddingBottom: {default: null},
        // TODO: Add UI to let user edit / clear padding.
        paddingTop: {default: null},
        objectId: {default: null},
    },
    content: "inline*",
    group: "block",
    parseDOM: [{tag: "p", getAttrs}],
    toDOM,
}

function getAttrs(dom: HTMLElement): any {
    const {
        lineHeight,
        textAlign,
        marginLeft,
        paddingTop,
        paddingBottom,
    } = dom.style

    let align: any = dom.getAttribute("align") || textAlign || ""
    align = ALIGN_PATTERN.test(align) ? align : null

    let indent = parseInt(dom.getAttribute(ATTRIBUTE_INDENT) || "", 10)

    if (!indent && marginLeft) {
        indent = convertMarginLeftToIndentValue(marginLeft)
    }

    indent = indent || MIN_INDENT_LEVEL

    const lineSpacing = lineHeight ? toCSSLineSpacing(lineHeight) : null

    const id = dom.getAttribute("id") || ""
    const objectId = dom.getAttribute("objectId") || null

    return {align, indent, lineSpacing, paddingTop, paddingBottom, id, objectId}
}

function toDOM(node: Node): Array<any> {
    const {
        align,
        indent,
        lineSpacing,
        paddingTop,
        paddingBottom,
        id,
        objectId,
    } = node.attrs
    const attrs:any = {}

    let style = ""
    if (align && align !== "left") {
        style += `text-align: ${align};`
    }

    if (lineSpacing) {
        const cssLineSpacing = toCSSLineSpacing(lineSpacing)
        style +=
            `line-height: ${cssLineSpacing};` + // This creates the local css variable `content-line-height`
            // that its children may apply.
            prefixed(`content-line-height: ${cssLineSpacing}`, { format: "cssVar" })
    }

    if (paddingTop && !EMPTY_CSS_VALUE.has(paddingTop)) {
        style += `padding-top: ${paddingTop};`
    }

    if (paddingBottom && !EMPTY_CSS_VALUE.has(paddingBottom)) {
        style += `padding-bottom: ${paddingBottom};`
    }

    style && (attrs.style = style)

    if (indent) {
        attrs[ATTRIBUTE_INDENT] = String(indent)
    }

    if (id) {
        attrs.id = id
    }
    attrs.objectId = objectId

    return ["p", attrs, 0]
}

export const toParagraphDOM = toDOM
export const getParagraphNodeAttrs = getAttrs

export function convertMarginLeftToIndentValue(marginLeft: string): number {
    const ptValue = convertToCSSPTValue(marginLeft)
    return clamp(
        MIN_INDENT_LEVEL,
        Math.floor(ptValue / INDENT_MARGIN_PT_SIZE),
        MAX_INDENT_LEVEL,
    )
}

export default ParagraphNodeSpec
