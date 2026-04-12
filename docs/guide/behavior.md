# Behavioral Biometrics

Profile how a user interacts with the page — typing rhythm, mouse movements, scroll patterns, touch characteristics.

## Usage

```ts
const collector = neoprint.behavior.start({
  duration: 10000,   // auto-stop after 10s
  trackTyping: true,
  trackMouse: true,
  trackScroll: true,
  trackTouch: true,
})

// ... user interacts with the page ...

const profile = collector.collect()

// Typing
profile.typing.avgDelay    // ms between keystrokes
profile.typing.rhythm      // array of inter-key delays

// Mouse
profile.mouse.avgSpeed     // px/ms
profile.mouse.curvature    // average direction change (radians)
profile.mouse.jitter       // micro-movement ratio (0–1)

// Scroll
profile.scroll.speed       // px/ms
profile.scroll.direction   // 'up' | 'down' | 'mixed'

// Touch
profile.touch.pressure     // force values array
profile.touch.size         // contact radius values array

// Manual stop
collector.stop()
```

## Use Cases

- **Fraud detection** — bots have unnatural typing rhythms and linear mouse paths
- **Continuous authentication** — verify the same person is still using the session
- **User experience** — understand how users interact with your UI
