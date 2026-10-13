# Evidence UA · Creatine module v1.0

Current stack: buildless static HTML / ES modules. Existing hash routing is preserved.

Scientific content belongs to `creatine/claims.ts`, `sources.ts`, and `evidenceRecords.ts`.
`creatineModule.ts` defines module metadata and sections. `presentation.mjs` defines ID-linked composition, guidance provenance, and the simplified ATP–PCr visualization.

Generic exports in `evidence-ui.mjs`: ClaimCard(claimId), ConfidenceBadge, EvidenceDrawer(claimId), SourceCard, ScientificNote, EvidenceGap, LastReviewed and MechanismInteractive.

Build: `node scripts/build-evidence.mjs`
Test: `node tests/evidence.test.mjs`

Requires Node 24 for built-in TypeScript stripping. No React/routing/design-system migration. Generated files in `dist/evidence/` should not be hand-edited.

The pre-migration page is retained in `creatine/legacy-page.html`; all old PubMed / NIH links are preserved in the visible review queue. Their outcomes were not silently attached to new Claims. Existing PubMed discovery controls remain operational; discovery does not approve scientific conclusions.

All eight confidence assessments are provisional. Module status is `reviewing`, not a final scientific approval. Risk-of-bias, overlap of primary studies, and funding/COI metadata require further review. Missing fields are explicitly unknown, not absent. Retracted/corrected sources remain in the registry; their status is visibly flagged in SourceCard.

ATP–PCr is a simplified educational stepper, not a performance simulator. Provenance is the ISSN position document. Guidance is not a fabricated efficacy Claim.

Future Labs and Evi were not implemented. New subjects can reuse these components with the same scientific entity contracts.

Visual increment: StructureExplorer / mountStructureExplorer consume `muscleVisual` metadata in presentation.mjs. Four selectable explanation anchors and three content views share one illustration. Source links remain mechanism provenance, not human-outcome evidence. Controls are accessible HTML; the artwork is static, not 3D or a quantitative model.

Asset: `src/evidence/assets/muscle-fiber-v1.webp` (built-in imagegen, converted to WebP). Prompt: standalone dark skeletal-muscle-fibre cutaway based on approved concept, parallel striated myofibrils, peripheral nuclei, orange mitochondria, no UI/text/molecular labels. Artistic simplifications are disclosed publicly. Build copies the asset into dist/evidence.

QA limitation: static/unit/regression checks do not substitute for an actual phone/browser layout check.

## Shared knowledge foundation

`core/types.ts` owns the shared scientific contracts; creatine/types.ts re-exports them for compatibility. `core/registry.mjs` is topic-independent and checks duplicate IDs, EVR links, assessment links and review links. Topic registration remains in the build composition; page orchestration and visual scenes remain creatine-specific, intentionally.

`ConfidenceAssessment` is separate from a public Claim: proposed confidence, five explicitly assessed/unassessed domains, evidence IDs and the Claim version under review. `ScientificReview` stores pending/approved/changes-requested state, approval provenance and event history. Seed migration creates only pending reviews and unassessed domains; it does not perform GRADE or change confidence.

The structural approval gate rejects missing provenance, incomplete domains, unreviewed EVRs, stale Claim versions and retracted/withdrawn/concern-flagged Sources. It is not an authenticated reviewer workflow or automatic Confidence Engine. No client approval editor or automatic public-conclusion updates exist. Future editorial tooling must authenticate reviewers, retain immutable evidence snapshots, revalidate after new evidence and publish approved changes explicitly.

EvidenceRecord now permits outcome-specific sample sizes, study counts and extraction locations. Existing seed fields are not fabricated to fill these contracts. Public drawer exposes assessment/history via progressive disclosure. Test-only other-topic Claims and synthetic approvals never enter production data.

## Topic-independent UI

`core/components.mjs` imports no topic or data bundle. It contains ClaimCard(id, base), EvidenceDrawer(id, base), ConfidenceBadge, SourceCard, ScientificNote, EvidenceGap, ReviewDetails, and the modal controller mountEvidenceDrawer(root, base). `bindEvidenceUI(base)` binds those components to any validated registry; evidence-ui.mjs is the compatibility adapter and creatine-specific page/visual orchestration. Existing `.eua-*` styles remain in the shared stylesheet; ID-scoped creatine layout guards remain topic-specific. This increment is not a universal page composer or a routing migration.

## Configured module composition

`core/module-composer.mjs` provides renderEvidenceModule(module, base, options) and mountEvidenceModule(root, base). Built-ins support hero, short answer, Claim grid, linked Sources and review metadata. Other scientific visuals/guidance sections register explicit renderers; unknown section types fail rather than silently disappearing. A custom shell preserves existing routes and branding.

Creatine now uses this composer with retained topic renderers. Section order, short-answer/grid/kidney Claim sets and Source sets come from creatineModule.ts. Existing anchors are retained via a view map. New simple topics can assemble from data alone; complex anatomy still needs its own reviewed renderer/assets. Synthetic alternate modules remain test fixtures, not public evidence or new Labs. Browser layout remains unverified.
