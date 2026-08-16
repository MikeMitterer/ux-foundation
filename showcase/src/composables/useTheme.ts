/**
 * Aktives Theme der Schaufenster-App.
 *
 * Die Logik liegt hier und nicht in einer Komponente: Komponenten stellen dar,
 * Zustand und Seiteneffekte gehören in ein Composable.
 *
 * Bewusst ohne Pinia — die App hat genau einen Zustand, und ein Store dafür
 * wäre eine Ebene zwischen Leser und Sache.
 */
import { readonly, ref, watch, type Ref } from 'vue'

import {
  DEFAULT_DARK_THEME,
  DEFAULT_LIGHT_THEME,
  isThemeId,
  THEMES,
  type ThemeId,
} from '@ux/index'

const STORAGE_KEY = 'ux-foundation.theme'

/**
 * Liest das gespeicherte Theme.
 *
 * In eine eigene Funktion gezogen, weil der Zugriff auf `localStorage` in
 * abgeschotteten Browsern wirft — nicht erst das Lesen, schon der bloße
 * Zugriff. Der Anstrich ist eine Bequemlichkeit; dafür soll die App nicht
 * stehenbleiben.
 */
function readStoredTheme(): ThemeId | null {
  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY)
    return isThemeId(stored) ? stored : null
  } catch {
    return null
  }
}

/** Schreibt die Wahl, still scheiternd aus demselben Grund. */
function writeStoredTheme(theme: ThemeId): void {
  try {
    window.localStorage?.setItem(STORAGE_KEY, theme)
  } catch {
    /* kein Speicher verfügbar — die Wahl gilt dann nur für diese Sitzung */
  }
}

/** Vorgabe ohne eigene Wahl: was das Betriebssystem sagt. */
function systemTheme(): ThemeId {
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches
  return prefersLight ? DEFAULT_LIGHT_THEME : DEFAULT_DARK_THEME
}

const current = ref<ThemeId>(readStoredTheme() ?? systemTheme())

watch(
  current,
  (theme) => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = THEMES[theme].isDark ? 'dark' : 'light'
    writeStoredTheme(theme)
  },
  { immediate: true },
)

export function useTheme(): {
  current: Readonly<Ref<ThemeId>>
  setTheme: (theme: ThemeId) => void
} {
  return {
    current: readonly(current),
    setTheme: (theme: ThemeId): void => {
      current.value = theme
    },
  }
}
