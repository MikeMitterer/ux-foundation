import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

/**
 * Konfiguration der Schaufenster-App.
 *
 * Sie liegt bewusst unter `showcase/` und nicht im Wurzelverzeichnis: Das
 * Paket selbst liefert nur `src/` aus (siehe `files` in der package.json). Die
 * App ist Werkzeug, kein Bestandteil der Auslieferung.
 */
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),

  plugins: [vue()],

  resolve: {
    alias: {
      // Auf die Quellen zeigen statt auf ein gebautes Paket: Änderungen am
      // Fundament sollen im Schaufenster sofort sichtbar sein.
      '@ux': fileURLToPath(new URL('../src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // Mixins und Farb-Helfer stehen in jeder Komponente zur Verfügung,
        // ohne dass jede SFC dieselbe `@use`-Zeile trägt.
        additionalData: '@use "@ux/styles/shared" as *;\n@use "@/styles/parts" as *;\n',
      },
    },
  },

  /*
   * Eigene Ports statt der Vite-Vorgaben: Auf 5173 läuft das StockInfo-
   * Dashboard, auf 5175 StockPortfolio. `strictPort` bricht den Start ab,
   * statt still auszuweichen — sonst zeigt der Browser die falsche App und man
   * sucht den Fehler in der Anwendung.
   */
  server: { port: 5177, strictPort: true },
  preview: { port: 4177, strictPort: true },

  build: {
    outDir: fileURLToPath(new URL('../dist-showcase', import.meta.url)),
    emptyOutDir: true,
    target: 'es2022',
  },
})
