import { Class } from "utility-types"
import { Fragment, Schema } from "prosemirror-model"
import { EditorState, TextSelection, Transaction } from "prosemirror-state"
import EditorView from "@editor/ui/editor/EditorView"
import React from "react"
import {
    hideCursorPlaceholder,
    showCursorPlaceholder,
} from "@editor/CursorPlaceholderPlugin"
import { IMAGE } from "@editor/NodeNames"
import UICommand from "@editor/ui/UICommand"
import createPopUp, { PopUpHandle } from "@editor/ui/createPopUp"

import { ImageLike } from "@editor/Types"

type InsertImageProps = {
    tr: Transaction
    schema: Schema
    src: string
    alt?: string
    title?: string
}

function insertImage({
    tr,
    schema,
    src,
    alt = "",
    title = "",
}: InsertImageProps): Transaction {
    const {selection} = tr
    if (!selection) {
        return tr
    }
    const {from, to} = selection
    if (from !== to) {
        return tr
    }

    const image = schema.nodes[IMAGE]
    if (!image) {
        return tr
    }

    const attrs = {
        src: src || "",
        alt: alt || "",
        title: title || "",
    }

    const node = image.create(attrs, undefined, undefined)
    const frag = Fragment.from(node)
    tr = tr.insert(from, frag)
    return tr
}

class ImageSourceCommand extends UICommand {
    _popUp: PopUpHandle | null = null

    getEditor(): Class<React.Component<any, any>> {
        throw new Error("Not implemented")
    }

    isEnabled = (
        state: EditorState,
        view: EditorView,
    ): boolean => {
        return this.__isEnabled(state, view)
    }

    waitForUserInput = (
        state: EditorState,
        dispatch: (tr: Transaction) => void | null | undefined,
        view: EditorView,
        event?: React.SyntheticEvent | null | undefined,
    ): Promise<any> => {
        if (this._popUp) {
            return Promise.resolve(undefined)
        }

        if (dispatch) {
            dispatch(showCursorPlaceholder(state))
        }

        return new Promise(resolve => {
            // @ts-ignore
            const props = {runtime: view ? view.runtime : null}
            this._popUp = createPopUp(this.getEditor(), props, {
                container: view.frameset,
                modal: true,
                onClose: val => {
                    if (this._popUp) {
                        this._popUp = null
                        resolve(val)
                    }
                },
            })
        })
    }

    executeWithUserInput = (
        state: EditorState,
        dispatch: (tr: Transaction) => void | null | undefined,
        view: EditorView,
        inputs?: ImageLike | null,
    ): boolean => {
        if (dispatch) {
            const {selection, schema} = state
            let {tr} = state
            tr = view ? hideCursorPlaceholder(view.state) : tr
            tr = tr.setSelection(selection)
            if (inputs) {
                const {src, alt, title} = inputs
                tr = insertImage({ tr, schema, src, alt, title })
            }
            dispatch(tr)
            view && view.focus()
        }

        return false
    }

    __isEnabled = (
        state: EditorState,
        view: EditorView,
    ): boolean => {
        const tr = state
        const {selection} = tr
        if (selection instanceof TextSelection) {
            return selection.from === selection.to
        }
        return false
    }
}

export default ImageSourceCommand
