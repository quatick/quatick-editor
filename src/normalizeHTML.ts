import {
  DOM_ATTRIBUTE_SIZE,
  HAIR_SPACE_CHAR,
  SPACER_SIZE_TAB,
} from "app/core/components/Editor/src/SpacerMarkSpec"
import patchAnchorElements from "app/core/components/Editor/src/patchAnchorElements"
import patchBreakElements from "app/core/components/Editor/src/patchBreakElements"
import patchElementInlineStyles from "app/core/components/Editor/src/patchElementInlineStyles"
import patchListElements from "app/core/components/Editor/src/patchListElements"
import patchMathElements from "app/core/components/Editor/src/patchMathElements"
import patchParagraphElements from "app/core/components/Editor/src/patchParagraphElements"
import patchStyleElements from "app/core/components/Editor/src/patchStyleElements"
import patchTableElements from "app/core/components/Editor/src/patchTableElements"
import toSafeHTMLDocument from "app/core/components/Editor/src/toSafeHTMLDocument"

const HTML_BODY_PATTERN = /<body[\s>]/i
const LONG_UNDERLINE_PATTERN = /_+/g

// This is a workround to convert "&nbsp;&nbsp;......&nbsp;" into wider tab
// tab spacers. For every 6 "&nbsp;", they will be converted into tab spacers.
const LONG_TAB_SPACE_PATTERN = /(&nbsp;){6}/g

const TAB_SPACER_HTML = new Array(6).join(
  `<span ${DOM_ATTRIBUTE_SIZE}="${SPACER_SIZE_TAB}">${HAIR_SPACE_CHAR}</span>`
)

function replaceNOBR(matched: string): string {
  // This is a workround to convert "_______" into none-wrapped text
  // that apppears like a horizontal line.
  if (matched && matched.length >= 20) {
    // needs extra space after it so user can escape the <nobr />.
    matched = `<nobr>${String(matched)}</nobr> `
  }
  return matched
}

export default function normalizeHTML(html: string): string {
  let body: HTMLElement | null | undefined = null

  const sourceIsPage = HTML_BODY_PATTERN.test(html)
  html = html.replace(LONG_UNDERLINE_PATTERN, replaceNOBR)

  // Convert every two consecutive "&nbsp;" into a spacer tab.
  html = html.replace(LONG_TAB_SPACE_PATTERN, TAB_SPACER_HTML)
  const doc = toSafeHTMLDocument(html)
  if (doc) {
    // styles.
    patchStyleElements(doc)
    patchElementInlineStyles(doc)
    // contents.
    patchAnchorElements(doc)
    patchBreakElements(doc)
    patchListElements(doc)
    patchParagraphElements(doc)
    patchTableElements(doc)
    patchMathElements(doc)
    body = doc.getElementsByTagName("body")[0]

    if (body && sourceIsPage) {
      // Source HTML contains <body />, assumes this to be a complete
      // page HTML. Assume this <body /> may contain the style that indicates
      // page"s layout.
      const frag = doc.createElement("html")
      frag.appendChild(body)
      return frag.innerHTML
    }
  }

  if (!body) {
    // <body /> should alway be generated by doc.
    return "Unsupported HTML content"
  }

  // HTML snippet only.
  return `<body>${body.innerHTML}</body>`
}