import { EditorState, Plugin, Transaction, PluginKey } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"
import { prefixed } from "app/core/components/Editor/src/util"

const PLACE_HOLDER_ID = {name: "CursorPlaceholderPlugin"}
let singletonInstance: CursorPlaceholderPlugin | null = null

// https://prosemirror.net/examples/upload/
const SPEC = {
    // [FS] IRAD-1005 2020-07-07
    // Upgrade outdated packages.
    key: new PluginKey("CursorPlaceholderPlugin"),
    state: {
        init() {
            return DecorationSet.empty
        },
        apply(tr, set) {
            set = set.map(tr.mapping, tr.doc)
            const action = tr.getMeta(this)
            if (!action) {
                return set
            }
            if (action.add) {
                const widget = document.createElement(prefixed("cursor-placeholder"))
                widget.className = prefixed("cursor-placeholder")
                const deco = Decoration.widget(action.add.pos, widget, {
                    id: PLACE_HOLDER_ID,
                })
                set = set.add(tr.doc, [deco])
            } else if (action.remove) {
                const found = set.find(null, null, specFinder)
                set = set.remove(found)
            }

            return set
        },
    },
    props: {
        decorations: state => {
            const plugin = singletonInstance
            return plugin ? plugin.getState(state) : null
        },
    },
}

class CursorPlaceholderPlugin extends Plugin {
    constructor() {
        super(SPEC)
        if (singletonInstance) {
            return singletonInstance
        }
        singletonInstance = this
    }
}

function specFinder(spec: any): boolean {
    return spec.id === PLACE_HOLDER_ID
}

function findCursorPlaceholderPos(
    state: EditorState,
): number | null | undefined {
    if (!singletonInstance) {
        return null
    }
    const decos = singletonInstance.getState(state)
    const found = decos.find(null, null, specFinder)
    const pos = found.length ? found[0].from : null
    return pos || null
}

export function showCursorPlaceholder(state: EditorState): Transaction {
    const plugin = singletonInstance
    let {tr} = state
    if (!plugin || !tr.selection) {
        return tr
    }

    const pos = findCursorPlaceholderPos(state)
    if (pos === null) {
        if (!tr.selection.empty) {
            // Replace the selection with a placeholder.
            tr = tr.deleteSelection()
        }
        tr = tr.setMeta(plugin, {
            add: {
                pos: tr.selection.from,
            },
        })
    }

    return tr
}

export function hideCursorPlaceholder(state: EditorState): Transaction {
    const plugin = singletonInstance
    let {tr} = state
    if (!plugin) {
        return tr
    }

    const pos = findCursorPlaceholderPos(state)
    if (pos !== null) {
        tr = tr.setMeta(plugin, {
            remove: {},
        })
    }

    return tr
}

export default CursorPlaceholderPlugin
