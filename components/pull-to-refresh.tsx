"use client"

import { useEffect, useRef, useState } from "react"

export function PullToRefresh() {
  const pullStartYRef = useRef<number | null>(null)
  const shouldRefreshRef = useRef(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const threshold = 80
    const topEdgeActivationPx = 48

    const isInsideOverlaySurface = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false
      }

      return Boolean(
        target.closest(
          '[data-ptr-ignore], [data-slot="drawer-content"], [data-slot="dialog-content"], [role="dialog"], [data-slot="popover-content"]'
        )
      )
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (isInsideOverlaySurface(event.target)) {
        return
      }

      const scrollTop =
        document.scrollingElement?.scrollTop ?? window.scrollY
      if (scrollTop > 0) {
        return
      }

      const startY = event.touches[0]?.clientY ?? null
      if (startY === null || startY > topEdgeActivationPx) {
        return
      }

      pullStartYRef.current = startY
      shouldRefreshRef.current = false
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (isInsideOverlaySurface(event.target)) {
        shouldRefreshRef.current = false
        return
      }

      if (pullStartYRef.current === null) {
        return
      }
      const currentY = event.touches[0]?.clientY ?? 0
      const deltaY = currentY - pullStartYRef.current
      if (deltaY > threshold) {
        shouldRefreshRef.current = true
      } else {
        shouldRefreshRef.current = false
      }
    }

    const handleTouchEnd = () => {
      if (shouldRefreshRef.current) {
        setIsRefreshing(true)
        setTimeout(() => window.location.reload(), 50)
      }
      pullStartYRef.current = null
      shouldRefreshRef.current = false
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  if (!isRefreshing) {
    return null
  }

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center">
      <div className="mt-2 rounded-full border bg-card px-4 py-1 text-xs text-muted-foreground shadow-sm">
        Refreshing...
      </div>
    </div>
  )
}
