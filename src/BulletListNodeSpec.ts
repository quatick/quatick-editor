import {Node} from 'prosemirror-model'

import {ATTRIBUTE_LIST_STYLE_TYPE} from './ListItemNodeSpec'
import {LIST_ITEM} from './NodeNames'
import {ATTRIBUTE_INDENT, MIN_INDENT_LEVEL} from './ParagraphNodeSpec'

import {NodeSpec} from './Types'

const AUTO_LIST_STYLE_TYPES = ['disc', 'square', 'circle']

const BulletListNodeSpec: NodeSpec = {
    attrs: {
        id: {default: null},
        indent: {default: 0},
        listStyleType: {default: null},
        objectId: {default: null},
    },
    group: 'block',
    content: LIST_ITEM + '+',
    parseDOM: [
        {
            tag: 'ul',
            getAttrs(dom: HTMLElement) {
                const listStyleType =
                    dom.getAttribute(ATTRIBUTE_LIST_STYLE_TYPE) || null

                const indent = dom.hasAttribute(ATTRIBUTE_INDENT)
                    ? parseInt(dom.getAttribute(ATTRIBUTE_INDENT) || "", 10)
                    : MIN_INDENT_LEVEL
                const objectId = dom.getAttribute('objectId') || null
                return {
                    indent,
                    listStyleType,
                    objectId,
                }
            },
        },
    ],

    toDOM(node: Node) {
        const {indent, listStyleType, objectId} = node.attrs
        const attrs:any = {}
        // [FS] IRAD-947 2020-05-26
        // Bullet list type changing fix
        attrs[ATTRIBUTE_INDENT] = indent
        if (listStyleType) {
            attrs[ATTRIBUTE_LIST_STYLE_TYPE] = listStyleType
        }

        let htmlListStyleType = listStyleType

        if (!htmlListStyleType || htmlListStyleType === 'disc') {
            htmlListStyleType =
                AUTO_LIST_STYLE_TYPES[indent % AUTO_LIST_STYLE_TYPES.length]
        }

        attrs.type = htmlListStyleType
        attrs.objectId = objectId
        return ['ul', attrs, 0]
    },
}

export default BulletListNodeSpec
