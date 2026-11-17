const BASE = 'https://www.dnd5eapi.co'
const cache = new Map()

export async function getJSON(path) {
  if (cache.has(path)) return cache.get(path)
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error('Error ' + res.status)
  const data = await res.json()
  cache.set(path, data)
  return data
}

export function imageUrl(path) {
  return path ? BASE + path : null
}

export function formatCR(cr) {
  if (cr === 0.125) return '1/8'
  if (cr === 0.25) return '1/4'
  if (cr === 0.5) return '1/2'
  return String(cr)
}

export function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}