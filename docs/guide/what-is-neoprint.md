# What is neoprint?

Neoprint is an advanced browser fingerprinting library that generates stable device identifiers from browser signals. It's open-source, modular, and privacy-aware.

## The Problem

Browser fingerprinting libraries typically:
- Generate a **single hash** that changes with every browser update
- Produce **identical hashes** for users on similar hardware (corporate laptops)
- Give **different hashes** in incognito mode
- Give **different hashes** on HTTP vs HTTPS
- Offer **no insight** into confidence, spoofing, or bot activity
- Put all useful features behind a **paywall**

## The Solution

Neoprint generates **4 different IDs** for different use cases, detects spoofing and bots, tracks fingerprint drift over time, and works across browsers — all in a single open-source package.

## Key Differentiators

### Cross-Browser Identification
Same user opens Chrome, then Firefox, then Safari — neoprint produces the **same `crossBrowserId`** using hardware-only signals (GPU, CPU math precision, screen, fonts).

### Anti-Detect Browser Detection
Detect Multilogin, GoLogin, Dolphin Anty, and other fraud tools via prototype chain analysis, Electron shell detection, and WebGL parameter inconsistencies.

### Fingerprint Lifecycle
Track how fingerprints evolve. When a browser updates and the hash changes, neoprint **auto-links** the old and new fingerprints with a probability score.

### Everything Else
Heuristic bot signals (30+ checks), behavioral biometrics, noise detection, incognito resistance, server-side validation hints, plugin system, privacy mode — all included, all free.

## Technical Overview

| Property | Value |
|---|---|
| **Language** | TypeScript |
| **Bundle size** | ~21 KB gzipped |
| **Dependencies** | Zero |
| **Output** | ESM + CJS |
| **Tree-shakeable** | Yes |
| **Collectors** | 22 built-in |
| **License** | MIT |
