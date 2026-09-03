import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

import { resolveAliases } from './aliases'

/**
 * Tests laufen ohne Browser: Geprüft wird die Logik des Pakets, nicht das
 * Aussehen. Was man ansehen muss, sieht man im Schaufenster an.
 *
 * Das Vue-Plugin ist trotzdem nötig: Die Tests greifen über `@ux/index` zu,
 * und dieser Barrel exportiert auch Komponenten. Der Umweg ist Absicht — so
 * prüfen sie nebenbei, dass die öffentliche Export-Fläche überhaupt lädt.
 *
 * Die Zuordnungen kommen aus `aliases.ts` — derselben Datei, aus der auch das
 * Schaufenster liest. Ein paar Tests hängen Schaufenster-Module ein, und die
 * zeigen untereinander mit `@/…` aufeinander; liefen die beiden Seiten
 * auseinander, prüfte der Testlauf andere Module, als die App lädt, und bliebe
 * dabei grün.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: { alias: resolveAliases() },
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
