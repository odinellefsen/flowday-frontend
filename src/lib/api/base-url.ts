"use client"

export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:3030`
  }
  return "http://localhost:3030"
}
