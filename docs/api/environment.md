# neoprint.environment()

<ApiRunner method="environment" />


Comprehensive environment profiling — device type, OS, browser, VM, and privacy tools.

## Signature

```ts
function environment(): Promise<EnvironmentResult>
```

## Returns

```ts
interface EnvironmentResult {
  type: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'vm' | 'emulator' | 'unknown'
  os: { name: string; version: string; spoofed: boolean }
  browser: { name: string; version: string; spoofed: boolean }
  vm: { detected: boolean; type?: string }
  privacy: {
    adBlocker: boolean
    trackingProtection: boolean
    resistFingerprinting: boolean
    tor: boolean
    vpn: 'likely' | 'unlikely' | 'unknown'
  }
}
```

## Example

```ts
const env = await neoprint.environment()

console.log(`${env.browser.name} ${env.browser.version} on ${env.os.name}`)

if (env.vm.detected) {
  console.log(`Running in VM: ${env.vm.type}`)
}

if (env.os.spoofed) {
  console.log('OS appears to be spoofed')
}
```
