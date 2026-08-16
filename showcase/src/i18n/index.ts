/**
 * i18n-Einrichtung der Schaufenster-App.
 *
 * Nur Deutsch: Die App richtet sich an das eigene Team. Der Aufbau ist
 * trotzdem der übliche, damit ein zweiter Katalog später nur dazukommt statt
 * einen Umbau auszulösen.
 */
import { createI18n } from 'vue-i18n'

import { de, type MessageSchema } from './de'

const FALLBACK_LOCALE = 'de'

/** Ermittelt die Start-Locale: Browser-Sprache, sonst Rückfall. */
function detectLocale(): string {
  const available = ['de']
  for (const lang of navigator.languages ?? [navigator.language]) {
    const base = lang.split('-')[0]
    if (available.includes(base)) return base
  }
  return FALLBACK_LOCALE
}

export const i18n = createI18n<[MessageSchema], 'de'>({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages: { de },
})
