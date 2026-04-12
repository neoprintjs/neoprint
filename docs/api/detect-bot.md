# neoprint.detectBot()

<ApiRunner method="detectBot" />


Detect automated browsers and bot frameworks.

## Signature

```ts
function detectBot(fp?: Fingerprint): BotResult
```

## Returns

```ts
interface BotResult {
  isBot: boolean    // true if score >= 0.2
  score: number     // 0–1 weighted score
  signals: string[] // which checks triggered
}
```

## Example

```ts
const fp = await neoprint.get()
const bot = neoprint.detectBot(fp)

if (bot.isBot) {
  console.log('Bot detected:', bot.signals)
}

// Can also run without a fingerprint (checks window/navigator only)
const bot = neoprint.detectBot()
```

## Signals

See [Bot Detection guide](/guide/bot-detection) for the full signal list.
