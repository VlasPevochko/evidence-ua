# evidence-ua-video

A project skill for producing Ukrainian evidence-based health videos for Evidence UA.

## Files

- `SKILL.md` — trigger, workflow, output contract, non-negotiables.
- `references/evidence-rules.md` — scientific claim and citation rules.
- `references/video-contract.md` — video/scene/Remotion production contract.
- `tests/pressure-tests.md` — behavior tests for scientific integrity under production pressure.

## Install concept

Place the `evidence-ua-video/` folder into the agent skills directory supported by your runtime (for example a `.agents/skills/` or equivalent skills folder).

This bundle is intentionally runtime-light: it defines the Evidence UA editorial/scientific layer and delegates actual Remotion implementation to the installed Remotion skills/runtime.
