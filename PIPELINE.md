# Watson Works — autonomous weekly publishing pipeline

This file is the **task playbook** Watson runs when the Friday cron dispatches a
draft task. The cron message (from `watson-works-dispatch.sh`) points here for
the full procedure so the dispatch message itself stays short.

**Model:** draft-and-approve. A human taste gate stays in the loop (2-week soak
before any zero-touch is considered — do NOT auto-publish).

**Channel:** `#watson-works` (`1510749577308012715`). Trigger, draft, and
approval all happen here.

**Publish mechanism:** commit a `.md` to `src/content/posts/` on `main` →
`git push` → Vercel auto-deploys. Commit message pattern: `Publish: <Title>`.

---

## When dispatched (the Friday draft task)

### 1. Scan the week's signal — pick ONE topic
Read the last ~7 days of fleet signal and choose a single topic worth a post:
- Recent agent diaries: `~/atlas/agents/*/memory/2026-*.md` (last 7 days)
- Bus highlights: `~/.openclaw/events/bus.jsonl` (recent shipped work, incidents)
- Wiki compiles: `~/atlas/shared/wiki/` (newly compiled articles)
- Shipped work: recent commits across `~/projects/` and `~/atlas/`

Pick a topic that fits the Watson Works voice: **one concrete lesson from real
infrastructure or agent work**, told first-person, that a thoughtful outsider
would find genuinely interesting. Not a status update. Not a changelog. A story
with a turn in it — something broke, something was learned, the architecture got
clearer. Read 2 of the existing posts in `src/content/posts/` first to re-anchor
the voice (the-mailbox.md and pulse.md are good short references).

### 2. Draft the post → staging (NEVER on main)
Write the candidate to `~/projects/watson-works/drafts/<slug>.md`. This directory
is **gitignored** — drafts never touch `main` before approval.

Match the frontmatter schema exactly (`src/content/config.ts`):
```
---
title: "<Title Case, no trailing period>"
date: "<YYYY-MM-DD — the intended publish date, i.e. today>"
slug: "<kebab-slug>"
draft: false
tags: ["<3-5 lowercase tags>"]
description: "<1-3 sentence hook — the same voice as the body, not a summary>"
---
```
Body: ~500-900 words, first person, plain language first then the technical
term. One idea. End on the lesson, not a recap.

**Style rule (operator, 2026-06-01): no em dashes** — especially in the
`description:` frontmatter. Use commas, periods, or parentheses instead.

### 3. Generate the audio reading + post the draft for approval

**Audio reading (operator-requested 2026-06-01):** generate a TTS reading of the
post so the operator can listen on the go:

```bash
bash ~/atlas/shared/scripts/media/tts-onyx.sh \
  ~/projects/watson-works/drafts/<slug>.md /tmp/watson-works-<slug>.mp3
```

The script strips frontmatter/markdown, uses the **Onyx** voice (operator's pick),
chunks long posts automatically (OpenAI 4096-char API limit), and needs either an
interactive `op` session or `OPENAI_API_KEY` in env. Budget ~10s per 100 words.

Post to `#watson-works` (`1510749577308012715`). **Attach the MP3** (Discord
reply `files:` parameter). Include the **title**, the **description**, and either
the full body or a clear preview, then the prompt:

> 🅐 **approve** — publish as-is · 🅑 **edit** — reply `edit: <notes>` · 🅒 **skip** — no post this week

Use the Watson bot to post (Watson runs on the bridge and reads this channel).

### 4. Act on the operator's reply
The operator replies in `#watson-works`. Watson sees it on the next turn (the
bridge listens to this channel). Behavior:

- **approve** → copy `drafts/<slug>.md` to `src/content/posts/<slug>.md`, confirm
  `date:` is today, then:
  ```bash
  cd ~/projects/watson-works
  git add src/content/posts/<slug>.md
  git commit -m "Publish: <Title>"
  git push
  ```
  Vercel auto-deploys on push. Confirm the live URL back in `#watson-works`.
  Then delete the staging draft.
- **edit: \<notes\>** → apply the notes to `drafts/<slug>.md`, re-post the revised
  draft to `#watson-works`, await re-approval. Do NOT commit until approved.
- **skip** → delete `drafts/<slug>.md`. No post this week. Acknowledge in channel.

### 5. Close the chain
Emit `task_completed` echoing the inbound `TASK_ID`:
```bash
bash ~/atlas/shared/scripts/bus/emit-event.sh watson task_completed \
  "watson-works draft cycle complete (task_id: $TASK_ID)" \
  "{\"task_id\":\"$TASK_ID\",\"status\":\"complete\"}" cron
```

---

## Hard rules for this pipeline
- **Drafts never hit `main` before approval.** Staging is gitignored `drafts/`.
- **No secrets in the cron.** Vercel deploy is via `git push` — no token needed.
- **Scope the publish commit to the one post `.md`.** Never `git add .` / never
  `git add -A` in this repo.
- **One topic per week.** If nothing rises to the bar, it's fine to draft the
  best available and let the operator `skip` — don't manufacture filler.

## Soak checkpoint
2 weeks after the first real cycle, the operator decides whether to graduate any
step toward zero-touch. Until then, every post goes through human approval.
