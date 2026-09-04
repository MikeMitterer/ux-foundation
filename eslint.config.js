import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

import {
  allowDirectGlobal,
  noDirectGlobal,
  noDirectGlobalInTemplate,
} from './src/eslint/index.ts'

/**
 * Die Speicher-Regel des Hauses, hier auf das eigene Paket angewandt.
 *
 * Warum sie gilt, steht im Skill `ux-standards`, Abschnitt „Speicher". Dass sie
 * bewacht wird und nicht bloß aufgeschrieben ist, hat einen gemessenen Anlass:
 * `useTheme.ts` hielt sie monatelang nicht ein, weil die Datei älter war als
 * `safeStorage` und danach niemand sie mehr öffnete.
 */
const STORAGE_RULE = {
  name: 'localStorage',
  message: 'Direkter Zugriff verboten — nimm `safeStorage` aus dem Fundament.',
}

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
    rules: noDirectGlobal(STORAGE_RULE),
  },
  {
    // Bei einer SFC sind es zwei Sperren: Die Kernregeln decken den
    // `<script>`-Teil ab, das Template braucht die Vue-Regel — dort ist der
    // Ausdruck ebenfalls ausführbarer Code.
    files: ['src/**/*.vue', 'showcase/src/**/*.vue'],
    rules: { ...noDirectGlobal(STORAGE_RULE), ...noDirectGlobalInTemplate(STORAGE_RULE) },
  },
  {
    // Die einzige Datei, die zugreifen darf — sie *ist* der geschützte Zugang.
    // Wächst diese Liste, ist fast immer die Regel falsch geschnitten.
    files: ['src/composables/safeStorage.ts'],
    rules: allowDirectGlobal(),
  },
)
