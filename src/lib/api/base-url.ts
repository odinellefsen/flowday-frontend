"use client"

const LOCAL_API_PORT = 3030
const PROD_API_URL = "https://api.flowday.io"

function isLocalHostname(hostname: string) {
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return true
  }

  // RFC1918 private IPv4 ranges used in local/LAN development.
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true
  }
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true
  }

  const match = hostname.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/)
  if (match) {
    const secondOctet = Number(match[1])
    return secondOctet >= 16 && secondOctet <= 31
  }

  return false
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
