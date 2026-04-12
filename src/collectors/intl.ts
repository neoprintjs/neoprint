import type { Collector, CollectorResult } from '../types.js'

export const intlCollector: Collector = {
  name: 'intl',
  async collect(): Promise<CollectorResult> {
    const start = performance.now()

    const dateOptions = Intl.DateTimeFormat().resolvedOptions()
    const numberOptions = Intl.NumberFormat().resolvedOptions()

    const data = {
      dateTimeFormat: {
        locale: dateOptions.locale,
        timeZone: dateOptions.timeZone,
        calendar: dateOptions.calendar,
        numberingSystem: dateOptions.numberingSystem,
      },
      numberFormat: {
        locale: numberOptions.locale,
        numberingSystem: numberOptions.numberingSystem,
        style: numberOptions.style,
        currency: (numberOptions as any).currency ?? null,
      },
      listFormat: typeof Intl.ListFormat !== 'undefined',
      relativeTimeFormat: typeof Intl.RelativeTimeFormat !== 'undefined',
      pluralRules: new Intl.PluralRules().select(0),
      displayNames: typeof (Intl as any).DisplayNames !== 'undefined',
      segmenter: typeof (Intl as any).Segmenter !== 'undefined',
    }

    const duration = Math.round((performance.now() - start) * 100) / 100

    return {
      value: data,
      duration,
      entropy: 5,
      stability: 0.85,
    }
  },
}
