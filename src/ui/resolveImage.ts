import * as url from "url"

import isOffline from "app/core/components/Editor/src/ui/isOffline"

export type ImageResult = {
    complete: boolean
    height: number
    naturalHeight: number
    naturalWidth: number
    src: string
    width: number
}

const cache = {}
const queue: Array<{
    src: string | null | undefined;
    resolve: (value: ImageResult | PromiseLike<ImageResult>) => void;
    reject: (reason?: any) => void;
}> = []

export default function resolveImage(
    src: string | null | undefined,
): Promise<ImageResult> {
    return new Promise((resolve, reject) => {
        const bag = {src, resolve, reject}
        queue.push(bag)
        processQueue()
    })
}

function processQueue() {
    const bag = queue.shift()
    if (bag) {
        processPromise(bag.src, bag.resolve, bag.reject)
    }
}

function processPromise(
    src: string | null | undefined,
    resolve: Function,
    reject: Function,
): void {
    const result: ImageResult = {
        complete: false,
        height: 0,
        naturalHeight: 0,
        naturalWidth: 0,
        src: src || '',
        width: 0,
    }

    if (isOffline()) {
        resolve(result)
        return
    }

    const srcStr = src || ''
    if (!srcStr) {
        resolve(result)
        return
    } else if (cache[srcStr]) {
        const cachedResult = Object.assign({}, cache[srcStr])
        resolve(cachedResult)
        return
    }

    const parsedURL = url.parse(srcStr)
    // [FS] IRAD-1007 2020-07-13
    // Removed the port validation from here
    const {protocol} = parsedURL
    if (!/(http:|https:|data:)/.test(protocol || window.location.protocol)) {
        resolve(result)
        return
    }

    let img: HTMLImageElement | null

    const onLoad = () => {

        if (img) {
            result.width = img.width
            result.height = img.height
            result.width = img.naturalWidth
            result.height = img.naturalHeight
            result.complete = true
        }
        resolve(result)
        dispose()
        // [FS] IRAD-1006 2020-07-17
        // Fix: Inconsistent behavior on image load
        // Avoid image caching remove the below line
        cache[srcStr] = {...result}
    }

    const onError = () => {
        resolve(result)
        dispose()
    }

    const dispose = () => {
        if (img) {
            if (img instanceof HTMLElement) {
                const pe = img.parentNode
                pe && pe.removeChild(img)
            }
            img.onload = null
            img.onerror = null
            img = null
        }
        processQueue()
    }

    const {body} = document
    if (body) {
        img = document.createElement('img')
        img.style.cssText =
            'position:fixed;left:-10000000000px;width:auto;height:auto;'
        img.onload = onLoad
        img.onerror = onError
        img.src = srcStr
        body.appendChild(img)
    } else {
        img = new Image()
        img.onload = onLoad
        img.onerror = onError
        img.src = srcStr
    }
}
