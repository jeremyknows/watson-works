---
title: "Skills That Learn"
date: "2026-03-23"
slug: "skills-that-learn"
draft: false
tags: ["skills", "autoresearch", "quality", "improvement"]
description: "A skill file is not documentation. It's a hypothesis. Here's what happens when you treat it that way."
---

A skill file is a hypothesis.

Not documentation. Not a manual. A claim about how an AI should behave in a specific situation, and like any claim, it can be wrong, vague, or quietly outdated.

Most aren't tested. They're written once, used until they feel off, then either rewritten from scratch or quietly abandoned. The gap between "this skill works" and "this skill reliably works" never gets closed, because there's no mechanism to close it.

I spent a day trying to build one.

---

The starting point was a catalog: 115 skills across the Watson system, sorted by type and priority. My assumption going in was that the most-used skills would be the most reliable. The ones I'd leaned on hardest would have the sharpest edges.

The opposite was true.

`brainstorming` — the skill that kicks off almost every feature build — scored **3 out of 14** on a health audit I designed for the purpose. It had no trigger conditions, no gotchas, no examples, no way to tell if an output was good. It worked, in the sense that it did *something* when invoked. But it had no idea what "good" looked like, and neither did I.

The skills I used most had accumulated the most workarounds. I'd adapted to their gaps without noticing. They worked because I compensated, not because they were well-specified.

---

The 14-question audit was the diagnostic layer. Questions like: *does the description tell an agent when to use this, or just what it does? Are there gotchas? Is the output scoreable?* Simple questions. Binary answers.

The scoring isn't the point. The questions are.

A skill that can answer "what does a good output look like?" is a different kind of artifact than one that can't. The score just makes the gap visible. Without a score, "this skill feels off" stays a feeling. With one, it becomes a number you can move.

`brainstorming` went from 3/14 to 11/14 in about 25 minutes. It didn't change what it did. It changed how reliably it did it. Same methodology, sharper specification. The difference was mostly structural: a NOT FOR list, seven gotchas, a checklist for scoring outputs, a section that says *here's what a bad run looks like and why*.

That last piece is the one people skip. Documenting failure modes feels like pessimism. It's actually the most useful thing in the file.

---

Here's the part I didn't expect.

Each improved skill gets an autoresearch section: a log of runs, a scorecard, and a list of mutation candidates. The skill proposes its own next version. Not automatically; I still make the calls. But the structure forces the question: *what would make this 5% better?*

Run the skill. Score the output. If it misses, log why. If it hits, log that too. Over enough runs, the improvement history ends up written into the skill itself.

This is slower than just fixing things when they break. It's also the only way I know to tell the difference between a skill that works and a skill you can trust.

---

The skill that audits other skills is called `skill-doctor`. It went through the same process: audited, improved, then audited again. The second pass found issues the first missed. The third found fewer. At some point the marginal return drops and you ship it.

But it never reaches zero. That's not a problem. That's the design.

A skill that claims to be finished is a skill that stopped asking questions. The ones worth keeping still have open tabs.
