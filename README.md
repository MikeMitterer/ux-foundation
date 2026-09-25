# @mmit/ux-foundation

Shared UI building blocks for Vue apps: design tokens, styles, icons,
components, composables, and a bridge to Naive UI.

## Contents

- [Install](#install)
- [Use](#use)
- [What's included](#whats-included)
- [Showcase](#showcase)
- [Check themes](#check-themes)
- [Publish](#publish)

---

## Install

```bash
npm install @mmit/ux-foundation
```

Vue is a peer dependency. Naive UI is an optional peer dependency; install it
only if your app uses `buildNaiveOverrides` or another Naive UI integration.

[↑ Contents](#contents)

---

## Use

Import the stylesheets you need. Load fonts and tokens before the reset:

```ts
// main.ts
import '@mmit/ux-foundation/styles/fonts.css'
import '@mmit/ux-foundation/styles/tokens.css'
import '@mmit/ux-foundation/styles/reset.css'
```

To make the SCSS helpers available in Vue components, add the shared module
to your Vite configuration:

```ts
// vite.config.ts
css: {
  preprocessorOptions: {
    scss: { additionalData: '@use "@mmit/ux-foundation/styles/shared" as *;\n' },
  },
},
```

The package ships source files, including `.ts`, `.vue`, and `.scss`. Exclude
it from Vite dependency prebundling so Vite can process the Vue files:

```ts
optimizeDeps: { exclude: ['@mmit/ux-foundation'] },
```

[↑ Contents](#contents)

---

## What's included

| Source | Contents |
|---|---|
| `src/styles/tokens.css` | Theme palettes, scales, and brand tokens |
| `src/styles/reset.css` | A compact CSS reset |
| `src/styles/fonts.css` | Variable Inter and Space Grotesk fonts |
| `src/styles/_shared.scss` | SCSS functions and mixins; emits no CSS on its own |
| `src/theme/` | Theme IDs and token-based Naive UI overrides |
| `src/icons/` | Navigation icons |
| `src/components/` | App shell, bars, navigation, theme picker, and display helpers |
| `src/composables/` | Breakpoints, locale detection, storage, notifications, and relative time |

See [`src/index.ts`](src/index.ts) for the public JavaScript and TypeScript
exports. Stylesheets are available through the paths shown above.

[↑ Contents](#contents)

---

## Showcase

The app in `showcase/` displays the components and themes together. It is a
development tool and is not included in the published package.

```bash
make setup
make dev       # http://localhost:5177
```

[↑ Contents](#contents)

---

## Check themes

`make test` runs the palette contrast checks along with the other tests. For a
detailed report, run:

```bash
python3 scripts/theme-tokens.py check src/styles/tokens.css --zonen
```

To inspect the available commands or export the palettes:

```bash
python3 scripts/theme-tokens.py --help
python3 scripts/theme-tokens.py export src/styles/tokens.css
```

[↑ Contents](#contents)

---

## Publish

This is a public scoped package on npmjs.org. `publishConfig.access` is set to
`public` in `package.json` for future releases.

```bash
make publish-dry              # inspect the package contents
make publish CONFIRM=yes      # publish a new version
```

[↑ Contents](#contents)
