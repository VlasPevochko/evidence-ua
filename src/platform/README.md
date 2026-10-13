# Platform catalog

`catalog.mjs` is the single navigation data source for directions, units and teaching routes. It is separate from scientific Claims, EVRs, assessment and review records. Learning order is not a causal edge and does not provide evidence for intervention efficacy.

`createCatalog` validates unique area/unit/path identities, local page links, unavailable-area behavior, canonical entity references and path targets. Available content may be a draft or an educational sketch: `available` means navigable, not scientifically approved. Review labels disclose that distinction without adding HIGH/MODERATE scores or scientific approval dates.

`scripts/build-platform.mjs` validates page existence and emits `dist/platform-catalog.js`. It also runs from `scripts/build-knowledge.mjs`. Both `directions.js` and `platform-shell.js` consume this generated catalog, so a new area does not need a bespoke navigation component.

Entity IDs remain in the existing shared registry. Muscle/cell controllers validate query parameters against their existing available structures; unknown IDs fall back to the original selection. No new scientific entity is manufactured from a URL.

`learningHref` carries the route ID and current position in the URL. `learningLocation` validates them against the actual page and anchor; route navigation shows previous/next material only for a matching location. No user profile, cookies, localStorage, tracking, server backend or automated scientific updates are introduced.

Existing routing, headers, designs and science remain. The shared shell adds one home header entry and compact navigation elsewhere. Embedded digestion content skips the shell, preserving its iframe use.
