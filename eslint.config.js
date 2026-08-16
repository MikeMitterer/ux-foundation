import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

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
)
