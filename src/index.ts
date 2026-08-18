/**
 * Gemeinsames Fundament der Oberflächen.
 *
 * Hier liegt, was **kein Urteil** enthält und deshalb in keiner App ein
 * zweites Mal entstehen darf: die Farb-Token aller Themes, die Skalen, der
 * Reset, die Schrifteinbindung, die wiederkehrenden Navigationssymbole und
 * die Brücke, die aus den Token die Naive-UI-Overrides baut.
 *
 * Was hier **nicht** liegt: Entscheidungen. Warum die Einstellungen links
 * stehen, warum es keinen Hamburger gibt, wie sich ein Dialog verhält — das
 * steht im `ux-standards`-Skill und braucht einen Menschen, der es liest.
 *
 * Die Stylesheets werden nicht von hier exportiert, sondern einzeln
 * importiert, damit eine App auch nur Teile übernehmen kann:
 *
 * ```ts
 * import '@mmit/ux-foundation/styles/fonts.css'
 * import '@mmit/ux-foundation/styles/tokens.css'
 * import '@mmit/ux-foundation/styles/reset.css'
 * ```
 *
 * ```scss
 * // vite.config.ts → css.preprocessorOptions.scss.additionalData
 * @use '@mmit/ux-foundation/styles/shared' as *;
 * ```
 */

export {
  DEFAULT_DARK_THEME,
  DEFAULT_LIGHT_THEME,
  isThemeId,
  THEME_IDS,
  THEMES,
  type ThemeId,
  type ThemeInfo,
} from './theme/themes'

export { buildBarNaiveOverrides, buildNaiveOverrides } from './theme/naive'

export {
  NAV_ICON_NAMES,
  NAV_ICONS,
  type IconDefinition,
  type IconPath,
  type NavIconName,
} from './icons/navIcons'

export { default as UxIcon } from './icons/UxIcon.vue'

export { default as UxAppShell } from './components/UxAppShell.vue'
export { default as UxTopbar } from './components/UxTopbar.vue'
export { default as UxNavItem } from './components/UxNavItem.vue'
export { default as UxInfoHint } from './components/UxInfoHint.vue'
export { default as UxCaret } from './components/UxCaret.vue'
export { default as UxThemePicker } from './components/UxThemePicker.vue'
export { default as UxNotificationProvider } from './components/UxNotificationProvider.vue'
export { default as UxStatusBar } from './components/UxStatusBar.vue'
export { default as UxInlineNumber } from './components/UxInlineNumber.vue'
export type { BackendState } from './components/UxStatusBar.vue'

export {
  useStateNotification,
  type StateNotificationOptions,
} from './composables/useStateNotification'
export { useNotifier, type Notifier, type NotifyOptions } from './composables/useNotifier'
export { minutesSince, useMinutesSince } from './composables/useRelativeTime'
export { browserLocale, detectLocale, persistLocale } from './composables/localeDetection'
export { safeStorage } from './composables/safeStorage'
export {
  BREAKPOINTS,
  COMPACT_BREAKPOINT_PX,
  useIsCompact,
  type BreakpointName,
} from './composables/useBreakpoint'
