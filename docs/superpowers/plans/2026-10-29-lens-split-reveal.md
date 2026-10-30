# Lens Split Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the lower-home lens visibly split to reveal real central content and a working action, reversing on upward scroll.

**Architecture:** Reuse the small native-scroll controller, separate reversible visual progress from sticky direction visibility, and render two clipped copies of the existing lens around accessible central HTML. The existing native jump moves inside the stage; the canonical six links remain the navigation source.

**Tech Stack:** Plain ES modules, CSS clip-path/transforms, existing WebP, Node24 tests, pinned Playwright/Chromium. No new runtime dependency.

**Spec:** docs/superpowers/specs/2026-10-29-lens-split-reveal-design.md

## Global Constraints

- Змінюється тільки лінза в нижній частині головної. Hero, хвиля, пошук, шапка, бібліотека, маршрути, наукові тексти й інші сторінки зберігаються.
- Нова бібліотека й runtime-залежність не додаються. Ті самі власні WebP; жодних сторонніх запитів.
- Анімаційний progress є оборотним. Видимість уже відкритих шести напрямів — окремий незворотний стан data-lens-complete.
- Native #cards, canonical шість напрямів, reduced-motion/no-JS і клавіатурна навігація зберігаються. Кнопка одна, всередині stage й поза aria-hidden.
- Два рухи 128+192 CSS px від onset показують усі шість реальних посилань у viewport на 360/390×844 і 1440×900. OPEN розділяє половини щонайменше на 120 CSS px на телефоні й 180 CSS px на desktop; BACK повертає декорацію до CLOSED.
- Без перехоплення wheel/touch, pin/sticky секції, scroll snap та автономного RAF-loop. Ціль кнопки ≥44 px; нуль overflow.
- Наукові frozen-еталони незмінні. CSS/JS cache query підвищуються. Гілки не видаляються, нове злиття лише після нового «зливай».

## Review Focus

- Upward scroll after full reveal must move actual image halves back while six links stay visible (Task1 unit, Task2 browser).
- A keyboard-focused central action must remain visible/clickable even when scroll would close the lens (Task1 focus behavior, Task2 actual focus/Enter).
- No-JS/reduced-motion or missing APIs must show a usable central action and all directions without gestures (Task1 defaults, Task2 browser).
- A narrow phone and desktop must show meaningful internal content and sufficient actual opening while preserving short scroll distance (Task1 layout contract, Task2 geometry/screenshots).
- Restored page, hidden tab, article view and cleanup must not leave frames running or hide navigation (Task1 lifecycle regression, Task2 idle/reload/route).

---

### Task 1: Reversible split image and accessible interior

**Files:**
- Modify: src/platform/home-lens.mjs, src/platform/home-directions.mjs, dist/home-lens.css, dist/index.html.
- Test: tests/home-lens.test.mjs, tests/home-lens-layout.test.mjs; update only directly affected UI contracts with owner-rationale comments.
- Generated: dist/home-lens.js and generated home markup via node scripts/build-platform.mjs.

**Interfaces:**
- Consumes: lensProgress(top, viewportHeight, sectionHeight), mountHomeLens(doc), homeDirectionsHTML(topics), existing CSS --lens-progress and [data-home-lens].
- Produces: reversible --lens-progress in [0,1]; sticky data-lens-complete for direction visibility; two .home-lens-half layers (--left/--right), each with existing .home-lens-art; .home-lens-interior with one existing [data-lens-reveal] anchor href="#cards", inside [data-lens-stage] but outside the aria-hidden .home-lens-decoration. Keep these selectors for Task2 measurement.

- [x] Write and run failing behavior tests: full reveal then back lowers progress to0 while six-direction-complete stays true; later forward works; no idle frame loop; central focus forces/retains open; no-JS/missing/reduced defaults and lifecycle remain safe. The real mountHomeLens is the system under test, fixtures model DOM APIs only.
- [x] Write and run failing parsed-DOM layout checks: two clipped image layers, one real internal jump outside aria-hidden ancestry, unique accessible action, same six escaped IDs/hrefs/status/order, lazy dimensions and cache versions2. Tests express this owner change, not arbitrary CSS source strings.
- [x] Implement reversible controller and sticky choices. Remove after-complete animation stop; retain coalescing, visibility/bfcache/article cleanup. Ensure interior focus is visible and cannot be hidden under keyboard use; no invisible pointer target in CLOSED.
- [x] Implement the two actual clipped image halves, visible central light/content/action and responsive CLOSED/MID/OPEN composition. Reuse existing assets, no scientific claims. Preserve the original single jump href and short reveal geometry; avoid affecting hero/shared pages. Default/failure view is OPEN.
- [x] Bump dist/index.html home-lens.css/js cache query1→2, rebuild via source, run focused tests then npm run check once; read final diff, commit only task files. Report RED/GREEN commands/logs, changedfiles and any concerns to assigned report. Do not run full Browser QA; Task2 owns it.

### Task 2: Actual interaction proof and final delivery

**Files:**
- Modify: scripts/browser-qa/run.mjs.
- Create: docs/HOME_LENS_SPLIT_REVEAL_REPORT.md and docs/screenshots/home-lens-split-reveal/ selected artifacts/JSON.
- Update: this plan's completion checkboxes after verified results.

**Interfaces:**
- Consumes Task1 selectors, actual DOM rectangles/transforms, reversible progress and sticky data-lens-complete. Existing canonical cards, native jump, fallback/idle checks remain.
- Produces regression coverage and measured artifacts for CLOSED/MID/OPEN/BACK and central button interaction at360/390/1440; final report inventories exact files/verification/rollback/limits.

- [x] Before changing assertions, run focused home QA on Task1 and retain expected old-contract failures (image count/decorative stage/reverse direction) plus any real defect. Update affected checks with owner rationale; do not weaken navigation, no-JS, idle, wave or scientific checks.
- [x] Extend lensSnapshot and homeLensFlow: measure actual image halves/internal content/button; native wheel128+192 yields OPEN with ≥120/180 CSS px separation and button opacity1 inside visible stage, unoccluded ≥44 px target, all six actual cardrects onscreen. Wheel−320 returns visual progress near0/halves CLOSED while all six links stay visible. MID differs. Save BEFORE artifact-induced scrolling.
- [x] Add actual center-action mouse/touch activation and keyboard focus/Enter; verify href#cards and first topic focus, no hidden/inert ancestor, no invisible hit target before reveal. Keep full noJS/reduced/missing lifecycle/idle/reload and touch/native-scroll checks.
- [x] Run focused home QA with artifacts until green, investigate any real defect through the owner of Task1. Independently inspect actual screenshots for readable attractive interior, visible separation and no clipped action at360/390/1440. Run full Browser QA once final production is stable. npm run check reruns only if code changed since Task1 green or final changes affect checks.
- [x] Generate preservation proof against09cdff1: hero HTML/runtime/style/header/catalog and11 scientific dossier subtrees unchanged, no asset size increase, exact pageheight/overflow measured. Copy selected original-size screenshots and measurements into docs; write final report including exact tests/check counts, generated outputs, references, rollback and physical-phone/direct-live limitations. Commit QA/docs.
- [ ] Root runs independent full-branch review, verifies clean exact tree, pushes feature and creates PR if API permits; new merge waits for owner.

Verified delivery: production `cb5290f6b64cecfabb9bcd61498792efd4b165d4`; CSS cache v2 / JS v3 after the partially visible action fix; unit/layout16/16 and full99/99+validation/smoke; final focused lens471/471; Browser QA3502/3502,21pages×2 plus360px home. Final evidence: `docs/HOME_LENS_SPLIT_REVEAL_REPORT.md` and immutable `final-dist-v2` (258files). Integration checkbox remains open for root; no new merge permission.
