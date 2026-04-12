# Plugin System

Extend neoprint with custom collectors.

## Registering a Plugin

```ts
neoprint.register('mySignal', {
  async collect() {
    const value = await getMyCustomData()
    return { value, entropy: 5 }
  },
  stability: 0.8,
})
```

The plugin is now included in `neoprint.get()` automatically.

## Plugin Interface

```ts
interface PluginCollector {
  collect(): Promise<{ value: unknown; entropy: number }>
  stability?: number  // 0–1, default 0.5
}
```

- **value** — Any serializable data
- **entropy** — Estimated bits of entropy this signal provides
- **stability** — How stable the signal is over time (affects confidence score)

## Examples

### WebTransport Support

```ts
neoprint.register('webTransport', {
  async collect() {
    const supported = typeof WebTransport !== 'undefined'
    return { value: { supported }, entropy: 1 }
  },
  stability: 0.9,
})
```

### Installed Browser Extensions

```ts
neoprint.register('extensions', {
  async collect() {
    const detected: string[] = []
    // Probe for known extension resources
    const extensions = [
      { name: 'ublock', url: 'chrome-extension://cjpalhdlnbpafiamejdnhcphjbkeiagm/web-accessible-resources/noop.html' },
    ]
    for (const ext of extensions) {
      try {
        const res = await fetch(ext.url, { method: 'HEAD', mode: 'no-cors' })
        detected.push(ext.name)
      } catch {}
    }
    return { value: detected, entropy: detected.length * 2 }
  },
  stability: 0.7,
})
```

## Managing Plugins

```ts
// List all collectors (built-in + plugins)
neoprint.collectors()

// Remove a plugin
neoprint.unregister('mySignal')
```
