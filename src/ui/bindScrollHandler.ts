type ScrollHandle = {
    dispose: () => void
}

export default function bindScrollHandler(
    target: Element,
    callback: FrameRequestCallback,
): ScrollHandle {
    this.enableOnScroll = true
    const defaultView = target.ownerDocument.defaultView
    const els: Array<any> = []

    let rid = 0

    let onScroll = () => {
        // Debounce the scroll handler.
        rid && cancelAnimationFrame(rid)
        rid = requestAnimationFrame(callback)
    }

    let el: any = target

    // Scroll event does not bubble, so we need to look up all the scrollable
    // elements.
    while (el) {
        const overflow = defaultView?.getComputedStyle(el).overflow
        if ((this.enableOnScroll && overflow === 'auto') || overflow === 'scroll') {
            el.addEventListener('scroll', onScroll, false)
            els.push(el)
        }
        el = el.parentElement
    }

    return {
        dispose() {
            while (this.enableOnScroll && els.length) {
                el = els.pop()
                el && el.removeEventListener('scroll', onScroll, false)
            }
            this.enableOnScroll = false
            rid && window.cancelAnimationFrame(rid)
            rid = 0
        },
    }
}
