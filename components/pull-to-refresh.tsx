"use client"

import { useEffect, useRef, useState } from "react"

export function PullToRefresh() {
  const pullStartYRef = useRef<number | null>(null)
  const shouldRefreshRef = useRef(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const threshold = 80

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
      if (isRefreshing) {
        return
      }

      if (isInsideOverlaySurface(event.target)) {
        return
      }

      const scrollTop =
        document.scrollingElement?.scrollTop ?? window.scrollY
      if (scrollTop > 0) {
        return
      }

      const startY = event.touches[0]?.clientY ?? null
      if (startY === null) {
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
      const scrollTop =
        document.scrollingElement?.scrollTop ?? window.scrollY

      // Only arm pull-to-refresh while the page is still pinned to top.
      if (scrollTop <= 0 && deltaY > threshold) {
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

    const handleTouchCancel = () => {
      pullStartYRef.current = null
      shouldRefreshRef.current = false
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })
    document.addEventListener("touchcancel", handleTouchCancel, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("touchcancel", handleTouchCancel)
    }
  }, [isRefreshing])

  if (!isRefreshing) {
    return null
  }

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center">
      <div className="mt-[calc(env(safe-area-inset-top)+0.5rem)] rounded-full border bg-card px-4 py-1 text-xs text-muted-foreground shadow-sm">
        Refreshing...
      </div>
    </div>
  )
}
