import { useEffect, useState } from 'react'

// Where the navigation lives. The web has no way to tell the iPhone Duo's
// outer display from its inner one -- 466x678 and 669x951 are almost the
// same shape -- so, like Journey, the switch is on viewport width alone.
//
// Below 440 nothing changes: a phone at 390 and a split-view pane at 375
// both keep the floating bottom bar. From 440 up the bar becomes a rail down
// the left edge, in every pose, since that display is sometimes only ~466pt
// tall and a bottom bar would eat a chunk of it. From 860 the rail widens
// and its tabs gain labels, using the width the inner display has in
// landscape.
export const RAIL_BREAKPOINT = 440
export const RAIL_WIDE_BREAKPOINT = 860

function readMode() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'bar'
  if (window.matchMedia(`(min-width: ${RAIL_WIDE_BREAKPOINT}px)`).matches) return 'rail-wide'
  if (window.matchMedia(`(min-width: ${RAIL_BREAKPOINT}px)`).matches) return 'rail'
  return 'bar'
}

// Live-updating rather than read-once, so unfolding or entering split view
// switches the layout immediately instead of only on the next reload.
export function useNavMode() {
  const [mode, setMode] = useState(readMode)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const queries = [
      window.matchMedia(`(min-width: ${RAIL_BREAKPOINT}px)`),
      window.matchMedia(`(min-width: ${RAIL_WIDE_BREAKPOINT}px)`),
    ]
    const onChange = () => setMode(readMode())
    queries.forEach((q) => q.addEventListener('change', onChange))
    return () => queries.forEach((q) => q.removeEventListener('change', onChange))
  }, [])

  return mode
}
