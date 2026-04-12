# Bot Detection

Detect automated browsers, headless Chrome, and popular automation frameworks.

## Usage

```ts
const fp = await neoprint.get()
const bot = neoprint.detectBot(fp)

console.log(bot.isBot)    // true / false
console.log(bot.score)    // 0.0 – 1.0
console.log(bot.signals)  // ['webdriver_present', ...]
```

## Detected Signals

| Signal | Weight | What it detects |
|---|---|---|
| `webdriver_present` | 3 | `navigator.webdriver === true` |
| `languages_empty` | 2 | No languages configured |
| `plugins_empty` | 1 | No browser plugins |
| `phantom_properties` | 3 | PhantomJS globals |
| `selenium_traces` | 3 | Selenium document properties |
| `puppeteer_traces` | 3 | Puppeteer evaluation script marker |
| `playwright_traces` | 3 | Playwright globals |
| `nightmare_traces` | 3 | Nightmare.js globals |
| `cdc_traces` | 3 | ChromeDriver `$cdc_` properties |
| `headless_chrome` | 3 | HeadlessChrome in UA |
| `missing_chrome_runtime` | 1 | Chrome UA but no `chrome.runtime` |
| `window_outersize_zero` | 2 | Zero window dimensions |
| `screen_size_zero` | 3 | Zero screen dimensions |
| `native_function_spoofed` | 2 | Overridden native functions |
| `error_stack_anomaly` | 2 | Automation in error stack traces |

## Score Threshold

A score of **0.2+** triggers `isBot: true`. The score is weighted — high-confidence signals (webdriver, headless UA) contribute more than low-confidence ones (missing plugins).
