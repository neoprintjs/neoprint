/**
 * MurmurHash3 (32-bit) — fast, non-cryptographic hash with excellent distribution.
 */
export function murmurhash3(input: string, seed: number = 0): number {
  let h = seed >>> 0
  const len = input.length
  let i = 0

  while (i + 4 <= len) {
    let k =
      (input.charCodeAt(i) & 0xffff) |
      ((input.charCodeAt(i + 1) & 0xffff) << 16)
    i += 2
    k |= 0
    k = Math.imul(k, 0xcc9e2d51)
    k = (k << 15) | (k >>> 17)
    k = Math.imul(k, 0x1b873593)
    h ^= k
    h = (h << 13) | (h >>> 19)
    h = Math.imul(h, 5) + 0xe6546b64
    i += 2
  }

  let k = 0
  switch (len & 3) {
    case 3:
      k ^= (input.charCodeAt(i + 2) & 0xffff) << 16
    // falls through
    case 2:
      k ^= (input.charCodeAt(i + 1) & 0xffff) << 8
    // falls through
    case 1:
      k ^= input.charCodeAt(i) & 0xffff
      k = Math.imul(k, 0xcc9e2d51)
      k = (k << 15) | (k >>> 17)
      k = Math.imul(k, 0x1b873593)
      h ^= k
  }

  h ^= len
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16

  return h >>> 0
}

/**
 * Hash any value into a hex string via MurmurHash3.
 */
export function hashComponents(components: Record<string, unknown>): string {
  const json = JSON.stringify(components, Object.keys(components).sort())
  const h1 = murmurhash3(json, 0)
  const h2 = murmurhash3(json, h1)
  const h3 = murmurhash3(json, h2)
  const h4 = murmurhash3(json, h3)
  return [h1, h2, h3, h4].map((h) => h.toString(16).padStart(8, '0')).join('')
}
