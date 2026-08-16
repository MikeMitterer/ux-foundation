/**
 * i18n-Einrichtung der Schaufenster-App.
 *
 * Nur Deutsch: Die App richtet sich an das eigene Team. Der Aufbau ist
 * trotzdem der übliche, damit ein zweiter Katalog später nur dazukommt statt
 * einen Umbau auszulösen.
 */
import { createI18n } from 'vue-i18n'

import { detectLocale } from '@ux/index'

import { de, type MessageSchema } from './de'

const AVAILABLE_LOCALES = ['de'] as const
const FALLBACK_LOCALE = 'de'
const STORAGE_KEY = 'ux-foundation.showcase.locale'

/*
 * Die Erkennung kommt aus dem Paket, das dieses Schaufenster vorführt — hier
 * eine eigene zu schreiben wäre die peinlichste Stelle für eine Kopie.
 */
export const i18n = createI18n<[MessageSchema], 'de'>({
  legacy: false,
  locale: detectLocale(AVAILABLE_LOCALES, FALLBACK_LOCALE, STORAGE_KEY),
  fallbackLocale: FALLBACK_LOCALE,
  messages: { de },
})
