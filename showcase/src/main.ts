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
import DemoNav from './DemoNav.vue'
import { i18n } from './i18n'

/*
 * `?demo=nav` rendert nur die Kopfzeile. Der Mobil-Abschnitt bettet die Seite
 * damit in iframes bei drei Breiten ein — `@media` richtet sich nach dem
 * Fenster, und ein iframe hat ein eigenes. Eine verkleinerte Nachbildung
 * zeigte dagegen die Regeln der vollen Fensterbreite.
 */
const nurNavigation = new URLSearchParams(window.location.search).get('demo') === 'nav'

createApp(nurNavigation ? DemoNav : App).use(i18n).mount('#app')
