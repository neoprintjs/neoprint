# Privacy Mode

Neoprint offers multiple modes to balance identification accuracy with user privacy.

## Modes

### Full Mode (default)
All 19 collectors active.

```ts
const fp = await neoprint.get({ mode: 'full' })
```

### Privacy Mode
Excludes invasive collectors (canvas, WebGL, audio, WebRTC, DOMRect, SVG).

```ts
const fp = await neoprint.get({ mode: 'privacy' })
```

### Incognito-Resistant Mode
Excludes collectors that behave differently in private browsing (storage, permissions, network).

```ts
const fp = await neoprint.get({ mode: 'incognito-resistant' })
```

## GDPR Considerations

Browser fingerprinting is considered personal data processing under GDPR and the ePrivacy Directive. You should:

1. **Get consent** before fingerprinting (unless used strictly for fraud prevention)
2. **Document** your legal basis (legitimate interest for security, consent for analytics)
3. **Don't store raw fingerprints** — store only the hashed ID
4. **Allow deletion** — clear stored session data when users request it

```ts
// Clear all neoprint data for a user
const session = neoprint.createSession()
await session.clear()

const lc = neoprint.lifecycle()
lc.clear()
```
