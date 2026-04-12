import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import LiveDemo from './components/LiveDemo.vue'
import ApiRunner from './components/ApiRunner.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LiveDemo', LiveDemo)
    app.component('ApiRunner', ApiRunner)
  },
} satisfies Theme
