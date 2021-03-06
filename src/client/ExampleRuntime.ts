// This implements the interface of `EditorRuntime`.
import {ImageLike} from "@editor/Types"
import {POST} from "@editor/client/http"

class ExampleRuntime {
    // Image Proxy
    canProxyImageSrc(): boolean {
        return false
    }

    getProxyImageSrc(src: string): string {
        // This simulate a fake proxy.
        const suffix = "proxied=1"
        return src.indexOf("?") === -1 ? `${src}?${suffix}` : `${src}&${suffix}`
    }

    // Image Upload
    canUploadImage(): boolean {
        return true
    }

    uploadImage(blob: Blob): Promise<ImageLike> {
        let img: ImageLike
        // [FS-AFQ][03-MAR-2020][IRAD-884#2]
        // Note: Resolving the promise blindly after 3 seconds causes two issues,
        // 1. Even if an image upload finishes in 700ms, it will take 3s for resolving the promise.
        // 2. If the image upload takes more than 3s, then the promise will be incorrectly resolved before completing the upload.
        // The following structure may be good to solve the issue.
        return new Promise((resolve, reject) => {
            // Use uploaded image URL.
            // @ts-ignore
            const url = "/saveimage?fn=" + blob.name
            POST(url, blob, "application/octet-stream").then(
                (data: string) => {
                    img = JSON.parse(data)
                    resolve(img)
                },
                err => {
                    img = {
                        id: "",
                        width: 0,
                        height: 0,
                        src: "",
                        alt: "",
                        title: "",
                    }

                    resolve(img)
                },
            )
        })
    }
}

export default ExampleRuntime
