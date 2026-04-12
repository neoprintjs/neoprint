# Why neoprint?

## Comparison with alternatives

| Feature | Typical open-source | **neoprint** |
|---|---|---|
| Signal count | ~10-15 | **20 built-in** |
| Multiple ID strategies | No (single hash) | **4 IDs: full, stable, weighted, cross-browser** |
| Cross-browser identification | No | **Same ID across Chrome, Firefox, Safari** |
| Anti-detect browser detection | No | **Multilogin, GoLogin, Dolphin Anty, ...** |
| Fingerprint lifecycle | No | **Drift prediction, auto-linking, decay rate** |
| Confidence scoring | No | **Per-collector stability + overall score** |
| Spoofing detection | No | **Cross-signal inconsistency analysis** |
| Bot detection | No | **30+ automation signals** |
| Noise detection | No | **Canvas/audio noise injection detection** |
| Incognito resistance | No (different hash) | **Same hash in normal and incognito** |
| Protocol-aware | No (HTTP != HTTPS) | **Auto-excludes HTTPS-only APIs on HTTP** |
| Server-side validation | No | **Checksums + environment hints** |
| Behavioral biometrics | No | **Typing, mouse, scroll, touch** |
| Environment profiling | Basic UA parsing | **OS/browser/VM/privacy tool detection** |
| Fuzzy comparison | No | **Tolerates minor browser updates** |
| Session linking | No | **Multi-storage persistence with fallbacks** |
| Plugin system | No | **Custom collectors with full API** |
| Privacy mode | No | **GDPR-friendly subset of signals** |
| Modular / tree-shakeable | Rarely | **Yes — import only what you need** |

## Common complaints we solve

### "Same fingerprint on different devices"
Corporate/school environments with identical hardware produce identical hashes. Neoprint's **weighted ID** prioritizes high-entropy signals, reducing collisions.

### "Different fingerprint after browser update"
A single signal change produces a completely new hash. Neoprint's **stable ID** uses only update-resistant signals (math, GPU, fonts).

### "Different fingerprint in incognito"
Storage quotas and permissions change in private browsing. Neoprint's **incognito-resistant mode** excludes volatile signals.

### "HTTP and HTTPS give different results"
Some APIs require secure context. Neoprint **automatically filters** collectors by protocol.

### "No way to detect spoofing"
Anti-detect browsers spoof individual signals but create inconsistencies. Neoprint **cross-references** signals to detect tampering.

### "I lose users after browser updates"
Neoprint's **lifecycle** module auto-links old and new fingerprints with a probability score.
