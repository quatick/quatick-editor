import {Node} from 'prosemirror-model'

import {toClosestFontPtSize} from './toClosestFontPtSize'
import {MarkSpec} from './Types'
import {prefixed} from './util'

const FontSizeMarkSpec: MarkSpec = {
    attrs: {
        pt: {default: null},
    },
    inline: true,
    group: 'inline',
    parseDOM: [
        {
            style: 'font-size',
            getAttrs: getAttrs,
        },
    ],
    toDOM(node: Node) {
        const {pt} = node.attrs
        const domAttrs = pt
            ? {
                style: `font-size: ${pt}pt;`,
                class: prefixed('font-size-mark'),
            }
            : null

        return ['span', domAttrs, 0]
    },
}

function getAttrs(fontSize: string): Object {
    const attrs:any = {}
    if (!fontSize) {
        return attrs
    }

    const ptValue = toClosestFontPtSize(fontSize)
    if (!ptValue) {
        return attrs
    }
    return {
        pt: ptValue,
    }
}

export default FontSizeMarkSpec
