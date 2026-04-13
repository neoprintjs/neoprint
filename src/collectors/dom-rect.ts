import type { Collector, CollectorResult } from '../types.js'

export const domRectCollector: Collector = {
  name: 'domRect',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const container = document.createElement('div')
    container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden'
    document.body.appendChild(container)

    const elements = [
      createStyledElement('span', {
        font: '14.5px/1 Arial',
        padding: '1.23px 3.45px',
        border: '0.78px solid',
      }),
      createStyledElement('div', {
        width: '100.5px',
        height: '50.3px',
        transform: 'rotate(0.1deg)',
      }),
      createStyledElement('span', {
        font: '11.7px/1.3 "Times New Roman"',
        letterSpacing: '0.03em',
        wordSpacing: '0.05em',
      }),
    ]

    for (const el of elements) {
      container.appendChild(el)
    }

    // Only use width/height — x/y change with scroll position
    const rects = elements.map((el) => {
      const r = el.getBoundingClientRect()
      return {
        width: r.width,
        height: r.height,
      }
    })

    document.body.removeChild(container)

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: rects,
      duration,
      entropy: 6,
      stability: 0.75,
    }
  },
}

function createStyledElement(tag: string, styles: Record<string, string>): HTMLElement {
  const el = document.createElement(tag)
  el.textContent = 'neoprint DOMRect test 123!'
  Object.assign(el.style, styles)
  return el
}
