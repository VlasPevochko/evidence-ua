# Historical baseline provenance

The import omitted original Sites history. Two tests previously used `git show` against missing commits. These fixtures were derived from those **actual historical Git objects**, retrieved read-only from the original Sites source repository on 2026-10-14. They were not generated from current GitHub source or current production files.

- `first-visit-v59-science-digests.json`: source commit `9d174ef146c09936be2c615e1a663b7e4f7dbd29`, `dist/index.html`, original whole-file SHA-256 `6c3c2821ab78583e79b92fed898c4d85cffc6daba6c0c2842ad315d88f25a959`. The ten direct-body article sections are serialized with `lxml.html.tostring(section, encoding='utf-8')` and hashed with SHA-256. The test retains both article order and byte-content equality checks through their digests. These historical digests independently match the already-imported v56 article fixture.
- `visitor-v58-file-hashes.json`: source commit `b48b9d0f5858673f8c6f9985c1984c198847031d`. SHA-256 of the original eight raw blobs preserves the former byte-equality check, including the binary muscle artwork, without duplicating large files.

Recovered old objects are only local verification material. This PR adds the digest fixtures, not the old history or later Sites source. Never refresh these baselines from current output merely to make a failing test pass; any scientific-content change needs a reviewed, explicitly justified new baseline.
