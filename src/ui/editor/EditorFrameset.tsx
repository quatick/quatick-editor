import React from "react"
import cx from "classnames"
import { prefixed } from "app/core/components/Editor/src/util"
import { useOnClickOutside } from "app/core/components/Editor/src/hooks/click-outside"

export interface EditorFramesetProps {
    body?: React.ReactElement<any> | null
    className?: string | null
    embedded?: boolean | null
    fitToContent?: boolean | null
    header?: React.ReactElement<any> | null
    height?: (string | number) | null
    toolbarPlacement?: "header" | "body" | null
    toolbar?: React.ReactElement<any> | null
    width?: (string | number) | null
    onBlur?: (event: MouseEvent) => void
}

export const FRAMESET_ROOT_CLASSNAME = prefixed("editor-frameset")
export const FRAMESET_BODY_CLASSNAME = prefixed("editor-frame-body")

function toCSS(val: (number | string) | null | undefined): string {
    if (typeof val === "number") {
        return val + "px"
    }
    if (val === undefined || val === null) {
        return "auto"
    }
    return String(val)
}

export function getParentFrameSet(el:Element) : HTMLDivElement | null {
    return el.closest(`.${FRAMESET_ROOT_CLASSNAME}`)
}

export const EditorFrameset:React.FC<EditorFramesetProps> = ({
    body,
    className,
    embedded,
    header,
    height,
    toolbarPlacement,
    toolbar,
    width,
    onBlur,
    fitToContent,
}) => {
    const root = React.useRef<HTMLDivElement | null>(null)

    useOnClickOutside(root, React.useCallback((event: MouseEvent) => {
        if (!onBlur) return
        const target = (event.target as HTMLElement)
        if (target.closest && !target.closest(prefixed("pop-up-element", { format: "selector" }))) {
            onBlur(event)
        }
    }, [onBlur]))

    const useFixedLayout = width !== undefined || height !== undefined
    let mainClassName = ""
    //  FS IRAD-1040 2020-17-09
    //  wrapping style for fit to content mode
    if (fitToContent) {
        mainClassName = cx(FRAMESET_ROOT_CLASSNAME, className, {
            "with-fixed-layout": useFixedLayout,
            fitToContent: fitToContent,
        })
    } else {
        mainClassName = cx(FRAMESET_ROOT_CLASSNAME, className, {
            "with-fixed-layout": useFixedLayout,
            embedded: embedded,
        })
    }

    const mainStyle = {
        width: toCSS(
            width === undefined && useFixedLayout ? "auto" : width,
        ),
        height: toCSS(
            height === undefined && useFixedLayout ? "auto" : height,
        ),
    }

    const toolbarHeader =
        toolbarPlacement === "header" || !toolbarPlacement ? toolbar : null
    const toolbarBody = toolbarPlacement === "body" && toolbar

    return (
        <div className={mainClassName} ref={root} style={mainStyle}>
            <div className={prefixed("editor-frame-main")}>
                <div className={prefixed("editor-frame-head")}>
                    {header}
                    {toolbarHeader}
                </div>
                <div className={FRAMESET_BODY_CLASSNAME}>
                    {toolbarBody}
                    <div className={prefixed("editor-frame-body-scroll")}>
                        {body}
                    </div>
                </div>
                <div className={prefixed("editor-frame-footer")} />
            </div>
        </div>
    )
}
