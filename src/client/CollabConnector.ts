import {Transform} from "prosemirror-transform"
import {EditorState} from "prosemirror-state"
import {Schema} from "prosemirror-model"
import SimpleConnector from "./SimpleConnector"
import {SetStateCall} from "./SimpleConnector"
import EditorConnection from "./EditorConnection"
import Reporter from "./Reporter"
import * as ReactDOM from "react-dom"

type IdStrict = number

class CollabConnector extends SimpleConnector {
    _clientID: string
    _connected: boolean
    _connection: any
    _docID: IdStrict
    _stepKeys: Object

    constructor(
        editorState: EditorState,
        setState: SetStateCall,
        config: {
            docID: IdStrict
        },
    ) {
        super(editorState, setState)
        const {docID} = config
        this._docID = docID

        // [FS][11-MAR-2020]
        // Modified the scripts to ensure not to always replace 3001 with 3002 to run both servers together,
        // instead used running hostname and configured port.
        const url =
            window.location.protocol +
            "//" +
            window.location.hostname +
            ":3002/docs/" +
            docID
        this._connection = new EditorConnection(setState, new Reporter(), url)

        this._connection.view = {
            updateState: s => {
                console.log("update", s)
                setState({editorState: s}, () => {})
            },
        }
    }

    onEdit = (transaction: Transform): void => {
        if (!this._connection.ready) {
            console.warn("not ready")
            return
        }
        ReactDOM.unstable_batchedUpdates(() => {
            this._connection.dispatch({type: "transaction", transaction})
        })
    }

    // FS IRAD-1040 2020-09-02
    // Send the modified schema to server
    updateSchema = (schema: Schema) => {
        this._connection.updateSchema(schema)
    }
}

export default CollabConnector
