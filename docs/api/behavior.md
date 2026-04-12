# neoprint.behavior

<ApiRunner method="behavior" />


Behavioral biometrics — profile typing, mouse, scroll, and touch patterns.

## Start Collecting

```ts
const collector = neoprint.behavior.start({
  duration: 10000,      // auto-stop after 10s (optional)
  trackTyping: true,    // default: true
  trackMouse: true,     // default: true
  trackScroll: true,    // default: true
  trackTouch: true,     // default: true
})
```

## Get Profile

```ts
const profile = collector.collect()
```

Returns:

```ts
interface BehaviorProfile {
  typing: { avgDelay: number; rhythm: number[] }
  mouse: { avgSpeed: number; curvature: number; jitter: number }
  scroll: { speed: number; direction: 'up' | 'down' | 'mixed' }
  touch: { pressure: number[]; size: number[] }
}
```

## Stop

```ts
collector.stop()
```

## Details

See [Behavioral Biometrics guide](/guide/behavior) for use cases and examples.
