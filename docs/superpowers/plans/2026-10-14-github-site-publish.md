# GitHub site build and artifact publication

Date: 2026-10-14

Goal: GitHub `main` is the source of truth. Keep Sites as the current host; prepare CI and document the remaining live-publication connection. Work in a separate PR without merging.

1. Audit README_IMPORT, build scripts, tests, workflows and Sites metadata. Confirmed: custom Node 24 build; complete tracked `dist` is required; Sites live v76 is newer than GitHub's imported v73; no GitHub website deployment or Pages configuration.
2. Recover the two original historical test commits read-only and replace historical Git dependencies with authentic checksummed fixtures. Never substitute the current source for an old baseline.
3. Add a sequential test runner that gives every test a fresh temporary copy and an independent Git index. Run all tests; restore isolation automatically.
4. Add a build wrapper that snapshots the complete existing `dist`, overlays the two documented build scripts, rejects missing files and changes to authored files, and packages the entire directory.
5. Replace the unrelated root Deno template with a SHA-pinned, read-only GitHub Actions workflow for PR verification and automatic `main` build/artifact publication. No production credentials or deployment on PRs. Include hidden files in the complete artifact.
6. Document source-of-truth rules, verified hosting, artifact retrieval/provenance, the v73/v76 gap, supported Sites publication prerequisites, rollback and branch protection recommendations.
7. Run tests, build, preservation checks and workflow validation. Request an independent code review, fix findings, push the feature branch and create/attach a PR. Do not merge or publish to Sites.
