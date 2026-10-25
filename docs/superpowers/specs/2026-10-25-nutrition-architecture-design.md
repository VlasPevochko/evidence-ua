# Nutrition architecture — owner-approved scope

The owner asked for execution without further design questions on 2026-10-25.
Nutrition becomes the general entry, retaining all existing diet cards and their
research verbatim. All other current Nutrition material moves to
`nutrition-inside.html`, titled «Харчування зсередини» with the subtitle
«Фізіологія та біохімія». The Japanese wave motif and current models stay.

The entry offers two clear routes: «Дієти й режими» (the retained on-page
catalogue) and «Харчування зсередини». Existing physiology sections, diagrams,
scripts, evidence and source disclosures are moved, not rewritten. Old model
URLs continue to open the equivalent material, including valid selected state.
The top utility row on these two pages becomes one contextual disclosure;
its controls remain available by keyboard and touch.

Approaches: moving sections into an independent page keeps the entry focused
and avoids loading the lab on diet visits. A second set of copied models or
hidden full-page panels would duplicate content and state; neither is needed.
The owner selected separation of the existing material, and delegated routine
implementation choices.

GitHub is the current source of truth and production is GitHub Pages. Work is
isolated on a branch and delivered through a PR. The legacy Sites publication
is not a deployment target for this change. Merge retains the repository's
explicit owner-approval requirement.
