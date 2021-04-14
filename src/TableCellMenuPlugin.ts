import {EditorState, Plugin, PluginKey} from "prosemirror-state"
import EditorView from "app/core/components/Editor/src/ui/editor/EditorView"
import findActionableCell from "app/core/components/Editor/src/findActionableCell"
import {atAnchorTopRight} from "app/core/components/Editor/src/ui/PopUpPosition"
import TableCellMenu from "app/core/components/Editor/src/ui/TableCellMenu"
import bindScrollHandler from "app/core/components/Editor/src/ui/bindScrollHandler"
import createPopUp, { PopUpHandle } from "app/core/components/Editor/src/ui/createPopUp"
import isElementFullyVisible from "app/core/components/Editor/src/ui/isElementFullyVisible"

class TableCellTooltipView {
    _cellElement: null | Node
    _popUp: PopUpHandle | null = null
    _scrollHandle: any = null

    constructor(editorView: EditorView) {
        this.update(editorView, null)
    }

    update(view: EditorView, lastState: EditorState | null): void {
        // @ts-ignore
        const {state, readOnly} = view
        const result = findActionableCell(state)

        if (!result || readOnly) {
            this.destroy()
            return
        }

        // These is screen coordinate.
        const domFound = view.domAtPos(result.pos + 1)
        if (!domFound) {
            this.destroy()
            return
        }

        let cellEl: any = domFound.node
        const popUp = this._popUp
        const viewPops = {
            editorState: state,
            editorView: view,
        }

        if (cellEl && !isElementFullyVisible(cellEl as HTMLElement)) {
            cellEl = null
        }

        if (!cellEl) {
            // Closes the popup.
            popUp && popUp.close(null)
            this._cellElement = null
        } else if (popUp && cellEl === this._cellElement) {
            // Updates the popup.
            popUp.update(viewPops)
        } else {
            // Creates a new popup.
            popUp && popUp.close(null)
            this._cellElement = cellEl
            // [FS] IRAD-1009 2020-07-16
            // Does not allow Table Menu Popuup button in disable mode
            // @ts-ignore
            if (!view.disabled) {
                this._popUp = createPopUp(TableCellMenu, viewPops, {
                    container: view.frameset,
                    anchor: cellEl,
                    autoDismiss: false,
                    onClose: this._onClose,
                    position: atAnchorTopRight,
                })
                this._onOpen()
            }
        }
    }

    destroy = (): void => {
        this._popUp && this._popUp.close(null)
        this._popUp = null
    }

    _onOpen = (): void => {
        const cellEl = this._cellElement
        if (!cellEl) {
            return
        }
        // @ts-ignore
        this._scrollHandle = bindScrollHandler(cellEl, this._onScroll)
    }

    _onClose = (): void => {
        this._popUp = null
        this._scrollHandle && this._scrollHandle.dispose()
        this._scrollHandle = null
    }

    _onScroll = (): void => {
        const popUp = this._popUp
        const cellEl = this._cellElement
        if (!popUp || !cellEl) {
            return
        }
        // @ts-ignore
        if (!isElementFullyVisible(cellEl)) {
            popUp.close(null)
        }
    }
}

// https://prosemirror.net/examples/tooltip/
const SPEC = {
    // [FS] IRAD-1005 2020-07-07
    // Upgrade outdated packages.
    key: new PluginKey("TableCellMenuPlugin"),
    view(editorView: EditorView) {
        return new TableCellTooltipView(editorView)
    },
}

class TableCellMenuPlugin extends Plugin {
    constructor() {
        super(SPEC)
    }
}

export default TableCellMenuPlugin
