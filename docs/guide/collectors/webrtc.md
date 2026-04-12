# WebRTC Fingerprinting

WebRTC fingerprinting creates a peer connection and observes ICE candidate types. This reveals network topology without exposing raw IP addresses.

## How it works

Neoprint creates an `RTCPeerConnection` with no ICE servers, generates an offer, and collects ICE candidates. Only candidate types are recorded (not IP addresses).

## Collected signals

| Signal | Description |
|---|---|
| **candidateCount** | Number of ICE candidates generated |
| **ipTypes** | Unique types: `mdns`, `private`, `public` |
| **hasMdns** | Whether mDNS candidates are present |
| **hasPrivate** | Whether private IP candidates are present |

## Privacy

Raw IP addresses are never stored or exposed. Only the type classification (mdns/private/public) is recorded.

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~4 bits |
| **Stability** | 0.50 |
| **Typical duration** | 50-100ms |

WebRTC is the slowest collector due to ICE candidate gathering. Neoprint resolves after the first candidate arrives (+ 50ms batch window) instead of waiting for the full gathering process.

Excluded in `privacy` mode.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['webrtc'] })
const rtc = fp.components.webrtc.value

console.log(rtc.candidateCount)  // 2
console.log(rtc.ipTypes)         // ["mdns"]
console.log(rtc.hasMdns)         // true
```
