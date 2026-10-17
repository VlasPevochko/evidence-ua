# evidence-ua

Static knowledge and evidence site for the current project snapshot.

## Local setup

Requirements:
- Node.js 24+
- Python 3

## Build

```bash
npm run build
```

## Preview locally

```bash
npm run start
```

Then open http://localhost:8000 in the browser.

## Tests

```bash
npm test
```

Run the full build and generated-site checks:

```bash
npm run check
```

This runs the build, content validation, the serial regression suite, and a smoke check of generated HTML pages, JavaScript syntax and module imports, local resources, CSS imports/assets (including inline styles), executable URL schemes, duplicate IDs, local HTML anchors, safe new-tab link relations, document language/title/main landmark, heading order, ARIA ID references, image alt attributes, form labels, and link/button names. Tests run serially because some rebuild shared output files. These basic markup checks do not replace a full accessibility audit or visual browser testing.

The generated site is served from the [dist](dist) folder, while source files live under [src](src).
