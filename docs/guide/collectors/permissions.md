# Permissions Fingerprinting

Permissions fingerprinting queries the state of 14 browser permission APIs. The combination of granted, denied, and prompt states is unique per user profile.

## Tested permissions

`geolocation`, `notifications`, `push`, `camera`, `microphone`, `accelerometer`, `gyroscope`, `magnetometer`, `clipboard-read`, `clipboard-write`, `midi`, `background-sync`, `persistent-storage`, `screen-wake-lock`

## Possible states

- `granted` — user previously allowed
- `denied` — user previously blocked
- `prompt` — not yet asked
- `unsupported` — API not available in this browser

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~5 bits |
| **Stability** | 0.65 |
| **Typical duration** | 4-6ms |

Excluded in `incognito-resistant` mode because permission states may reset in private browsing.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['permissions'] })
const perms = fp.components.permissions.value

console.log(perms.notifications)  // "granted"
console.log(perms.camera)        // "prompt"
console.log(perms.midi)          // "unsupported"
```
