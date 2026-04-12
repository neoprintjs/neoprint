# Confidence & Entropy

## Confidence Score

Every fingerprint includes a `confidence` score (0–1) that tells you how reliable the identification is.

```ts
const fp = await neoprint.get()
console.log(fp.confidence) // 0.87
```

Confidence is calculated from three factors:

- **Coverage** (30%) — How many collectors returned valid data. If 15 out of 19 succeed, coverage is 0.79.
- **Stability** (50%) — Average stability of successful collectors. Stable signals (math: 0.95) weigh more than volatile ones (network: 0.30).
- **Entropy** (20%) — Average entropy normalized to 0–1. More bits = more unique = higher confidence.

## Entropy

Entropy measures how many bits of identifying information the fingerprint contains.

```ts
console.log(fp.entropy) // 94.5 bits
// 2^94.5 ≈ 19.8 septillion possible unique fingerprints
```

Higher entropy = more unique fingerprint = less likely to collide with another device.

## When to Trust a Fingerprint

| Confidence | Meaning | Action |
|---|---|---|
| 0.8+ | Strong identification | Trust the fingerprint |
| 0.5–0.8 | Moderate | Use with other signals (cookies, sessions) |
| < 0.5 | Weak | Don't rely on fingerprint alone |

Low confidence usually means:
- Many collectors failed (privacy extensions, restrictive browser)
- Browser has fingerprinting resistance enabled
- Running in a very restricted environment
