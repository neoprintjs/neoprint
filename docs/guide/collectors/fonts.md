# Font Fingerprinting

Font fingerprinting detects which fonts are installed on the user's system. Since font sets vary between operating systems, languages, and user-installed software, they provide significant entropy.

## How it works

Neoprint tests 48 font families by measuring text width differences against baseline fonts. For each test font, a string is rendered in three base fonts (monospace, sans-serif, serif) and then with the test font as the primary family. If the width changes, the font is installed.

```ts
const testString = 'mmmmmmmmmmlli1WwQqYy@#$%'
const fontSize = '72px'

// Measure baseline
const baseWidth = ctx.measureText(testString).width  // using "monospace"

// Test specific font
const testWidth = ctx.measureText(testString).width  // using "'Arial', monospace"

// If widths differ, Arial is installed
```

### Tested font families (48)

The test list includes system fonts, cross-platform fonts, and OS-specific fonts:

- **Cross-platform**: Arial, Courier New, Georgia, Times New Roman, Verdana
- **Windows**: Calibri, Cambria, Consolas, Segoe UI, Tahoma
- **macOS**: Monaco, Menlo, SF Pro, SF Mono, Helvetica, Futura, Optima
- **Linux**: Roboto, Noto Sans, Ubuntu, DejaVu Sans, Liberation Sans, Fira Sans
- **Popular web fonts**: Open Sans, Lato, Source Sans Pro, PT Sans

## Why it's effective

| OS | Typical installed fonts | Unique fonts |
|---|---|---|
| macOS | ~70-100 | SF Pro, SF Mono, Helvetica Neue, Optima, Didot |
| Windows | ~50-80 | Calibri, Cambria, Segoe UI, Consolas |
| Linux (Ubuntu) | ~30-50 | Ubuntu, Noto Sans, Liberation Sans |
| Android | ~15-25 | Roboto, Noto Sans |
| iOS | ~60-80 | SF Pro, New York, Academy Engraved |

Users who install design software (Adobe, Figma) or developer tools get additional fonts, further differentiating their profile.

## Entropy and stability

| Property | Value |
|---|---|
| **Entropy** | ~12 bits |
| **Stability** | 0.90 |
| **Typical duration** | 3-5ms |

Fonts are highly stable (only change when user installs/removes fonts) and high-entropy (many possible combinations across 48 families).

## Role in cross-browser ID

Fonts are installed at the OS level, not the browser level, making them a key signal for [`crossBrowserId`](/guide/fingerprint-ids). The same font set is visible from Chrome, Firefox, and Safari on the same machine.

## Usage

```ts
const fp = await neoprint.get({ collectors: ['fonts'] })
const fonts = fp.components.fonts.value
// ["Arial", "Arial Black", "Comic Sans MS", "Courier", "Courier New", ...]

console.log(fonts.length)  // number of detected fonts from the test list
```
