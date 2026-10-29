import { useEffect, useState } from 'react'

// Where the navigation lives, by viewport width.
//
// This only ever actually promotes to a rail on the inner display (and a
// plain wide window) -- not the outer one. Safari on the Duo's outer
// display reserves a column on the right edge for its own system controls
// (time, battery, wifi) and keeps web content off it entirely; the width a
// page gets there is ~382pt in portrait and ~368pt in landscape, which is
// narrower than or about the same as an ordinary phone, not wider. A native
// app can still put its own controls in that reserved column (UIKit's
// UISceneAccessory) -- a web page cannot, and there is no manifest field or
// meta tag for it. Apple has said it is "investigating" opening that space
// to web content, with no API or date given, so the outer display staying
// in bar mode here is not a bug to chase: it is a phone-sized canvas today,
// full stop, regardless of what number this threshold uses.
//
// Below 440 nothing changes: a phone at 390 and a split-view pane at 375
// both keep the floating bottom bar -- and so, for the reason above, does
// the Duo's outer display. From 440 up the bar becomes a rail down the left
// edge, which in practice means the inner display and a wide browser
// window. From 860 the rail widens and its tabs gain labels, using the
// width the inner display has in landscape.
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
