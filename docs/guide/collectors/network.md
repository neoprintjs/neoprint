# Network Fingerprinting

Network fingerprinting reads connection information from the Network Information API. Available primarily in Chromium-based browsers.

## Collected signals

| Signal | Example | Notes |
|---|---|---|
| **effectiveType** | `4g` | Estimated connection type |
| **downlink** | `10` | Mbps bandwidth estimate |
| **rtt** | `50` | Round-trip time in ms |
| **saveData** | `false` | Data saver mode |
| **type** | `wifi` | Connection type (when available) |
| **onLine** | `true` | `navigator.onLine` |

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~3 bits |
| **Stability** | 0.30 |
| **Typical duration** | <1ms |

Lowest stability of all collectors. Values change with network conditions. Excluded in `incognito-resistant` mode.

## HTTPS dependency

Network Information API is only available in secure contexts (HTTPS). On HTTP, neoprint automatically excludes this collector from the hash.

## Web Worker offloading

Network collector runs in a Web Worker by default. `navigator.connection` is available in Worker contexts.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['network'] })
const net = fp.components.network.value

console.log(net.effectiveType)  // "4g"
console.log(net.rtt)            // 50
```
