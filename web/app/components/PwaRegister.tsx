"use client"
import { useEffect } from "react"

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    let intervalId: number | null = null

    const onControllerChange = () => {
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      const maybeSkipWaiting = () => {
        const sw = reg.waiting
        if (sw) sw.postMessage({ type: "SKIP_WAITING" })
      }

      reg.addEventListener("updatefound", () => {
        const installing = reg.installing
        if (!installing) return
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed") {
            if (navigator.serviceWorker.controller) maybeSkipWaiting()
          }
        })
      })

      intervalId = window.setInterval(() => {
        reg.update().catch(() => {})
      }, 30000)

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") reg.update().catch(() => {})
      })
    }).catch(() => {})

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [])

  return null
}
