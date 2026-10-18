# Spine zone and "point to the pain" guidance — backlog and staging

_Status: backlog / design note. Recorded 2026-10-18 from an owner idea. Nothing in this document is implemented._

## 1. The idea (owner's words, condensed)

A person looks at a model of the body (ideally 3D), points at the place that hurts, and gets either **exercises** or a way to **book an online consultation**. The first target zone is the **spine**.

This is a good product direction and it fits the long-term sequence in `docs/NORTH_STAR.md` (Foundation → Interactive Evidence → **Personal Evidence** → Evi → marketplace). It is **not** safe or in scope to build in one step today.

## 2. Why the full version is not built now

| North Star rule | Why it blocks the full version |
|---|---|
| §9 Product safety: tools must not imply diagnosis from a single symptom, hotspot, image or movement; no unsupported personalised treatment recommendation | "You pointed here → do these exercises" is a personalised recommendation derived from one hotspot. The Atlas already states the rule *"Точка болю ≠ джерело болю"*. |
| §7 Explicitly NOT NOW: personalised treatment plans, marketplace, large monetisation systems | Booking paid consultations is the first step of a marketplace; a pain-to-plan flow is a personalised plan. |
| §10 Scope gate / §16 readiness | It introduces Personal Evidence (Layer C) before its prerequisites exist: reviewed Claims for exercises, explicit scientific-review status, stable Atlas. Exercise entries are still editorial drafts with no Claims attached. |

Real-world risks that make the order matter:

- **Safety.** Back pain can carry red flags (new numbness or weakness, loss of bladder/bowel control, saddle numbness, fever, night pain, trauma, unexplained weight loss). For these people exercises are the wrong answer and delay is harmful. The pointed location often does not match the source of pain.
- **Data.** "Where it hurts" plus contact details for a booking is personal health data: consent, privacy policy, secure storage, retention and deletion, and compliance with applicable data-protection law (including Ukrainian law and, if EU users are served, GDPR) must be settled first.
- **Consultations and money.** Practitioner licensing, liability, terms of service, payments, refunds, and who vets specialists.

## 3. Staged plan

### Stage 0 — safe step (can start now; fits the current phase)
Goal: make the spine zone *navigable and educational* without personalising anything.

1. Atlas zone **«Хребет»** moves from "Готується" to **Beta** as a navigation hub (same pattern as the «М'язи» zone).
2. A model of the spine **by region**: cervical, thoracic, lumbar, sacrum/coccyx. Clicking a region shows *education only*: what the region does, in plain language.
3. Every region shows **"When to seek medical care" (red flags) before any exercise content**, in neutral, non-alarming wording, reviewed by a qualified person.
4. **Related practice**: exercises from the library whose `atlasZones` include `spine`, presented as *educational examples* with the existing draft label, never as a prescription.
5. **"Find a specialist"** as a plain pointer (how to choose a licensed professional) or a link to a scheduling page the owner already operates. **No in-product booking, no data collection.**
6. No pain map, no radiation patterns, no "possible causes" lists for the lumbar spine until a clinician has reviewed the wording.

Acceptance: the Atlas safety stance (§9) is visible on every region; tests forbid diagnostic or curative wording (same list as the Exercise Library); browser QA covers the new flows; nothing is stored about the visitor.

### Stage 1 — prerequisites for Personal Evidence (not started)
- Reviewed Claims for at least the exercises that would be suggested; explicit review status in the UI.
- A clinician (or equivalent qualified reviewer) approves region texts and the red-flag screen.
- A written rule set: what may be suggested, to whom, with which caveats; a refusal path ("seek care first").
- Decision on data handling (Section 2) before any collection.

### Stage 2 — guided pointing (only after Stage 1)
- The visitor picks an area and answers a short **screening** (red flags first). Positive screen → care-seeking message, **no exercises**.
- Negative screen → *educational* options, wording "hypothesis, not diagnosis", and a visible education / screening / diagnosis distinction.

### Stage 3 — consultation booking (only after Stage 2, and a separate decision)
- Preferably an **external, established booking service**, so Evidence UA does not store health data or process payments itself.
- Specialist onboarding and vetting, terms, and a clear statement that approval of a material is not endorsement of a practitioner.

## 4. 3D model options (for Stage 0)

- **Own schematic 3D** generated from simple shapes: no licence issues, clearly labelled "schematic", but not anatomically accurate.
- **Existing open model (`.glb`/`.gltf`)** supplied by the owner. Candidate sources include Z-Anatomy and BodyParts3D (CC BY-SA: attribution and share-alike; confirm what share-alike means for the model versus the site code), NIH 3D, and Sketchfab models under CC BY or CC0. **Check the licence page of the specific file before use.**
- Technical constraints: viewer library self-hosted (e.g. `three.js`, MIT) because the site loads no third-party resources; load the 3D scene only after an explicit click; target a few MB at most for mobile; keyboard access and a text alternative; fallback when WebGL is unavailable; browser QA coverage.

## 5. Open questions for the owner

1. Which 3D route for Stage 0 (own schematic vs a supplied model)?
2. Is there a clinician or physiotherapist who can review region texts and the red-flag screen?
3. If a "find a specialist" link is wanted in Stage 0, which page should it point to?
4. Target audience and jurisdictions (affects data-protection and consultation rules).

## 6. Non-goals until Stage 1 is complete

- Any statement that a pain location indicates a specific condition.
- Exercise suggestions generated from a pointed location.
- Collecting symptom data, contact details, or payments in the product.
- Ranking or promoting individual practitioners.
