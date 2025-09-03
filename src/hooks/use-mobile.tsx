import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
    }

    // ✅ initial check
    setIsMobile(mql.matches)

    // ✅ add event listener (cross-browser)
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange)
    } else {
      mql.addListener(onChange) // Safari fallback
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange)
      } else {
        mql.removeListener(onChange)
      }
    }
  }, [])

  return isMobile
}
