/**
 * Werkzeuge für Wächter-Tests einbindender Apps.
 *
 * **Eigener Einstiegspunkt und nicht Teil von `@mmit/ux-foundation`.** Was hier
 * liegt, braucht den TypeScript-Compiler und den Vue-SFC-Parser; ein
 * UI-Fundament schleppt beides nicht in seine Laufzeit. Sie stehen deshalb als
 * **optionale** Peers in der `package.json` — wer diesen Einstiegspunkt nicht
 * importiert, merkt nichts davon.
 *
 * ```ts
 * import { findDirectAccess } from '@mmit/ux-foundation/testing'
 *
 * it('läuft ausschließlich über safeStorage', () => {
 *   expect(
 *     findDirectAccess({
 *       name: 'localStorage',
 *       roots: ['src'],
 *       allow: ['src/lib/storage.ts'],
 *     }),
 *   ).toEqual([])
 * })
 * ```
 */
export { findDirectAccess, findDirectAccessInFile, type DirectAccessQuery } from './directAccess'
