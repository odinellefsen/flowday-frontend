"use client"

const LOCAL_API_PORT = 3030
const PROD_API_URL = "https://api.flowday.io"

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1"
}

export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
  }

  if (typeof window !== "undefined" && window.location.hostname) {
    if (isLocalHostname(window.location.hostname)) {
      return `http://${window.location.hostname}:${LOCAL_API_PORT}`
    }

    return PROD_API_URL
  }

  return `http://localhost:${LOCAL_API_PORT}`
}
