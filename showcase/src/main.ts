/**
 * Einstieg der Schaufenster-App.
 *
 * Die Reihenfolge der Stylesheet-Importe ist nicht beliebig: Schriften und
 * Token zuerst, dann der Reset. Der Reset greift auf Token zu, und die
 * Schrift soll stehen, bevor das erste Zeichen gemalt wird.
 */
import { createApp } from 'vue'

import '@ux/styles/fonts.css'
import '@ux/styles/tokens.css'
import '@ux/styles/reset.css'
import './styles/showcase.scss'

import App from './App.vue'
import { i18n } from './i18n'

createApp(App).use(i18n).mount('#app')
