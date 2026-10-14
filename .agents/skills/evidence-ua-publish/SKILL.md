---
name: evidence-ua-publish
description: Use when an approved Evidence UA video must be packaged, scheduled, or published to social platforms such as YouTube Shorts, Instagram Reels, or TikTok.
---

# Evidence UA Publish

## Overview

Turn one approved Evidence UA master video into platform-specific publishing packages without changing the scientific meaning.

**Core principle:** one master story, platform-specific metadata.

## Required input

Read `video/projects/<slug>/output/publish.json`, `qc.json`, and the final `master.mp4` metadata.

Do not publish when:
- `qc.json` contains an unresolved scientific blocker;
- the master video is missing or clearly corrupt;
- the user has asked only for drafts/previews;
- a platform action requires approval or connection that has not been granted.

## Workflow

1. Verify the master asset and QC state.
2. Create one shared semantic core: topic, accurate hook, one-sentence takeaway, CTA, source note.
3. Adapt metadata per platform rather than copying blindly.
4. Preserve the same scientific claim across all platforms.
5. If a connected publisher is available, use it for the requested platform action.
6. If direct publishing is unavailable, produce a complete upload package instead of pretending the post was published.
7. Record the outcome in `publish.json`: `drafted`, `scheduled`, `published`, `failed`, or `manual_upload_required`.

## Platform defaults

### YouTube Shorts
- Strong searchable title; avoid stuffing hashtags into the title.
- Description can include a concise explanation, source/context note, and a small set of relevant hashtags.
- Prefer keywords people actually search for in Ukrainian.

### Instagram Reels
- Caption should open with the hook/takeaway, then concise context and CTA.
- Hashtags are secondary metadata, not the main caption.
- Keep the first lines useful before truncation.

### TikTok
- Shorter, conversational caption.
- Use a limited set of topical keywords/hashtags rather than a large generic block.
- Do not distort a claim merely to make it more sensational.

## Publishing provider

Prefer a single multi-platform publishing service when available so scheduling/status remain centralized. Keep provider-specific credentials and IDs outside the repository.

Current recommended integration path: Metricool or another connected publisher that explicitly supports the user's target accounts. The skill must work even when no publisher is connected by producing manual upload packages.

## `publish.json` schema

```json
{
  "slug": "example-topic",
  "master": "master.mp4",
  "shared": {
    "topic": "",
    "hook": "",
    "takeaway": "",
    "cta": "",
    "sources_note": ""
  },
  "platforms": {
    "youtube_shorts": {"title": "", "description": "", "keywords": [], "hashtags": [], "status": "drafted"},
    "instagram_reels": {"caption": "", "keywords": [], "hashtags": [], "status": "drafted"},
    "tiktok": {"caption": "", "keywords": [], "hashtags": [], "status": "drafted"}
  }
}
```

## Non-negotiables

- Never claim a post is published or scheduled unless the platform/provider confirms it.
- Never store access tokens, passwords, cookies, or API secrets in GitHub.
- Never change a medical/scientific conclusion between platforms.
- Never invent citations or hashtags implying unsupported benefits.
- Never publish a draft video when the approved master differs.
- Preserve Ukrainian as the default language unless the user requests another language.
