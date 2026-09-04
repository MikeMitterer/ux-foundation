import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

import { noDirectGlobals, noDirectGlobalsInTemplates } from './src/eslint/index.js'

/** Sperren des Hauses. Warum sie gelten, steht im Skill `ux-standards`. */
const RESTRICTED = [
  {
    name: 'localStorage',
    message: 'Direkter Zugriff verboten — nimm `safeStorage` aus dem Fundament.',
  },
]

/** Der geschützte Zugang selbst — er muss zugreifen dürfen. */
const STORAGE_GATEWAY = 'src/composables/safeStorage.ts'

/**
 * Lint-Regeln. Bewusst nah an den Empfehlungen — eigene Regeln nur dort, wo
 * die Hauskonventionen etwas verlangen, das die Voreinstellung nicht kennt.
 */
export default tseslint.config(
  { ignores: ['dist/', 'dist-showcase/', 'node_modules/', '*.tsbuildinfo'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    // Browser-Globals: `document`, `getComputedStyle`, `HTMLSelectElement` und
    // Geschwister. Ohne diese Zeile meldet `no-undef` sie als undefiniert —
    // ein Fehler, der nur nach einer fehlenden Konfiguration aussieht.
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    rules: {
      // `any` ist verboten — bei unbekanntem Typ `unknown`.
      '@typescript-eslint/no-explicit-any': 'error',
      // Mehrwortige Komponentennamen sind hier unnötig: Das Präfix `Ux`
      // beziehungsweise `Showcase` trennt bereits eindeutig.
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['src/**/*.ts', 'showcase/src/**/*.ts'],
    ignores: [STORAGE_GATEWAY],
    rules: noDirectGlobals(RESTRICTED),
  },
  {
    // Bei einer SFC sind es zwei Sperren: Die Kernregeln decken den
    // `<script>`-Teil ab, das Template braucht die Vue-Regel — dort ist der
    // Ausdruck ebenfalls ausführbarer Code.
    files: ['src/**/*.vue', 'showcase/src/**/*.vue'],
    rules: { ...noDirectGlobals(RESTRICTED), ...noDirectGlobalsInTemplates(RESTRICTED) },
  },
)
