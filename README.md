# evidence-ua

Static knowledge and evidence site for the current project snapshot.

## Local setup

Requirements:
- Node.js 24+
- Python 3 with `lxml==6.1.1` (`python -m pip install lxml==6.1.1`)

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

This runs the retained-dist build with provenance, content validation, the regression suite in a fresh copy per test file, and a smoke check of generated HTML pages, JavaScript syntax and module imports, local resources, CSS imports/assets (including inline styles), executable URL schemes, duplicate IDs, local HTML anchors, safe new-tab link relations, document language/title/main landmark, heading order, ARIA ID references, image alt attributes, form labels, and link/button names. GitHub CI runs these same gates before publishing artifacts. These basic markup checks do not replace a full accessibility audit or visual browser testing.

The smoke check uses `python` on Windows and `python3` elsewhere; set `PYTHON` to select another Python 3 executable. Scientific retention tests use the reviewed fixtures documented in [baseline provenance](tests/fixtures/README_BASELINES.md); do not refresh hashes merely to silence a failure.

The generated site is served from the [dist](dist) folder, while source files live under [src](src).
