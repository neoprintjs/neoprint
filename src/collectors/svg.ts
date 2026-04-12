import type { Collector, CollectorResult } from '../types.js'

export const svgCollector: Collector = {
  name: 'svg',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const ns = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(ns, 'svg')
    svg.setAttribute('width', '200')
    svg.setAttribute('height', '60')
    svg.style.cssText = 'position:absolute;left:-9999px;visibility:hidden'

    // Rect with filter
    const defs = document.createElementNS(ns, 'defs')
    const filter = document.createElementNS(ns, 'filter')
    filter.setAttribute('id', 'np-blur')
    const blur = document.createElementNS(ns, 'feGaussianBlur')
    blur.setAttribute('stdDeviation', '2.5')
    filter.appendChild(blur)
    defs.appendChild(filter)
    svg.appendChild(defs)

    const rect = document.createElementNS(ns, 'rect')
    rect.setAttribute('x', '10')
    rect.setAttribute('y', '5')
    rect.setAttribute('width', '80')
    rect.setAttribute('height', '30')
    rect.setAttribute('fill', '#ff6347')
    rect.setAttribute('filter', 'url(#np-blur)')
    svg.appendChild(rect)

    // Text
    const text = document.createElementNS(ns, 'text')
    text.setAttribute('x', '100')
    text.setAttribute('y', '30')
    text.setAttribute('font-size', '14')
    text.setAttribute('font-family', 'serif')
    text.textContent = 'neoprint SVG'
    svg.appendChild(text)

    // Circle with gradient
    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('cx', '160')
    circle.setAttribute('cy', '30')
    circle.setAttribute('r', '15')
    circle.setAttribute('fill', '#4682b4')
    circle.setAttribute('opacity', '0.7')
    svg.appendChild(circle)

    document.body.appendChild(svg)

    // Serialize to string (rendering differences between browsers)
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)

    // Also grab the computed bounding boxes
    const textBBox = text.getBBox()
    const bboxData = {
      x: textBBox.x,
      y: textBBox.y,
      width: textBBox.width,
      height: textBBox.height,
    }

    document.body.removeChild(svg)

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: { svg: svgString, textBBox: bboxData },
      duration,
      entropy: 7,
      stability: 0.8,
    }
  },
}
