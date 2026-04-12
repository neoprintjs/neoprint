# Storage Fingerprinting

Storage fingerprinting tests which storage APIs are available and reads storage quota estimates. Quota values differ between normal and incognito browsing.

## Collected signals

| Signal | What it checks |
|---|---|
| **localStorage** | Can write and read |
| **sessionStorage** | Can write and read |
| **indexedDB** | Is available |
| **cookieEnabled** | `navigator.cookieEnabled` |
| **storageEstimate** | `navigator.storage.estimate()` quota and usage |
| **privateBrowsing** | Quota below 120MB heuristic |

## Role in incognito detection

Storage quota is the primary signal for detecting private browsing:
- Chrome normal: ~10GB quota
- Chrome incognito: ~4GB quota
- Safari normal: ~80GB quota
- Safari private: ~1GB quota

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~4 bits |
| **Stability** | 0.60 |
| **Typical duration** | 5-7ms |

Excluded in `incognito-resistant` mode because values change in private browsing.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['storage'] })
const s = fp.components.storage.value

console.log(s.localStorage)     // true
console.log(s.storageEstimate)  // { quota: 10737422464, usage: 4224 }
```
