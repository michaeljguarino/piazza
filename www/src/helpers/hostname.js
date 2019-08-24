export function localized(path) {
  const hostname = window.location.hostname
  const proto = window.location.protocol
  const port = window.location.port
  if (!port) {
    return `${proto}//${hostname}${path}`
  }
  return `${proto}//${hostname}:${port}${path}`
}

export function apiHost() {
  switch (window.location.hostname) {
    case "localhost":
      return "chat.piazzaapp.com"
    default:
      return window.location.hostname
  }
}