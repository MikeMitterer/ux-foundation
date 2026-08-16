import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

/**
 * Tests laufen ohne Browser: Geprüft wird die Logik des Pakets, nicht das
 * Aussehen. Was man ansehen muss, sieht man im Schaufenster an.
 *
 * Das Vue-Plugin ist trotzdem nötig: Die Tests greifen über `@ux/index` zu,
 * und dieser Barrel exportiert auch Komponenten. Der Umweg ist Absicht — so
 * prüfen sie nebenbei, dass die öffentliche Export-Fläche überhaupt lädt.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@ux': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    /*
     * `happy-dom` statt `node`: Ein Test hängt Komponenten ein, um das
     * Toast-Verhalten zu prüfen — dafür braucht es ein Dokument. Die reinen
     * Logik-Tests laufen darin genauso.
     */
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
  },
})
