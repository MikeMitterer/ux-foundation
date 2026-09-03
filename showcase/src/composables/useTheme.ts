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
  safeStorage,
  THEMES,
  type ThemeId,
} from '@ux/index'

const STORAGE_KEY = 'ux-foundation.theme'

/** Liest das gespeicherte Theme; `null`, wenn keines oder ein unbekanntes. */
function readStoredTheme(): ThemeId | null {
  const stored = safeStorage.read(STORAGE_KEY)
  return isThemeId(stored) ? stored : null
}

/** Schreibt die Wahl; das Misslingen wird nicht ausgewertet. */
function writeStoredTheme(theme: ThemeId): void {
  safeStorage.write(STORAGE_KEY, theme)
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
