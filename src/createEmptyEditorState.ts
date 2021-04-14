import {Schema} from "prosemirror-model"
import {EditorState} from "prosemirror-state"
import {Plugin} from "prosemirror-state"

import convertFromJSON from "app/core/components/Editor/src/convertFromJSON"

export const EMPTY_DOC_JSON = {
    type: "doc",
    content: [
        {
            type: "paragraph",
            content: [
                {
                    type: "text",
                    text: " ",
                },
            ],
        },
    ],
}

export default function createEmptyEditorStateschema(
    schema?: Schema | null | undefined,
    plugins?: Array<Plugin> | null | undefined,
): EditorState | null {
    // TODO: Check if schema support doc and paragraph nodes.
    return convertFromJSON(EMPTY_DOC_JSON, schema, plugins)
}
