import React from "react"
import { EditorView } from "prosemirror-view"
import scrollIntoView from "smooth-scroll-into-view-if-needed"
import { sanitizeURL } from "@editor/URLs"
import CustomButton from "@editor/ui/custom/CustomButton"
import { prefixed } from "@editor/util"

function isBookMarkHref(href: string): boolean {
    return !!href && href.indexOf("#") === 0 && href.length >= 2
}

class LinkTooltip extends React.Component<any, any> {
    props: {
        editorView: EditorView
        href: string
        onCancel: (view: EditorView) => void
        onEdit: (view: EditorView) => void
        onRemove: (view: EditorView) => void
    }

    _unmounted = false

    state = {
        hidden: false,
    }

    render() {
        const {href, editorView, onEdit, onRemove} = this.props
        // [FS] IRAD-1013 2020-07-09
        // Change button in "Apply Link" missing in LICIT.

        return (
            <div className={prefixed("link-tooltip")}>
                <div className={prefixed("link-tooltip-body")}>
                    <div className={prefixed("link-tooltip-row")}>
                        <CustomButton
                            className={prefixed("link-tooltip-href")}
                            label={href}
                            onClick={this._openLink}
                            target="new"
                            title={href}
                            value={href}
                        />
                        <CustomButton
                            label="Change"
                            onClick={onEdit}
                            value={editorView}
                        />
                        <CustomButton
                            label="Remove"
                            onClick={onRemove}
                            value={editorView}
                        />
                    </div>
                </div>
            </div>
        )
    }

    _openLink = (href: string): void => {
        if (isBookMarkHref(href)) {
            const id = href.substr(1)
            const el = document.getElementById(id)
            if (el) {
                const {onCancel, editorView} = this.props
                onCancel(editorView)
                ;(async () => {
                    // https://www.npmjs.com/package/smooth-scroll-into-view-if-needed
                    await scrollIntoView(el, {
                        scrollMode: "if-needed",
                        // block: "nearest",
                        // inline: "nearest",
                        behavior: "smooth",
                    })
                })()
            }
            return
        }
        if (href) {
            window.open(sanitizeURL(href))
        }
    }
}

export default LinkTooltip
