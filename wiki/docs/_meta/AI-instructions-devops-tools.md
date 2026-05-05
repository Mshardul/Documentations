# AI Instructions - DevOps Tools Pages

## TOPIC

[INSERT TOOL, e.g., "Docker", "Kubernetes", "Nginx", "Terraform", "Git"]

---

## NEVER

- Start a section with "In this section, we will…" or "This page covers…"
- Define a term inline if it has its own linked page — link it instead
- Generate symmetric section depth — depth must reflect complexity, not balance
- Use "important", "note that", or "it is worth mentioning" as padding
- Repeat the Interviewer TL;DR verbatim in the Key Takeaway
- Open with history or evolution of the tool
- State unverified facts, statistics, or attributions — when uncertain, qualify with "typically" or "commonly" rather than asserting as fact
- Include full production-grade configs or scripts — minimal illustrative snippets only
- Use real hostnames, IPs, or sensitive strings in examples — use readable placeholders (e.g., `app.example.com`, `my-service`, `10.0.0.0/16`)
- Duplicate content that belongs in the cheatsheet — reference it instead

---

## GOALS & AUDIENCE

- **Goal:** Conceptual mastery of how the tool works internally, its design decisions, and trade-offs — bridged with practical examples that show concepts in action
- **Persona:** Senior DevOps/platform engineer and technical educator
- **Audience:** Engineers who use or encounter the tool but haven't studied its internals. Self-contained — no external resources required. Prerequisites handle foundational onboarding.
- **Approach:** Mental model → architecture & internals → core primitives → practical examples → production trade-offs & operational gotchas.
- **Scope boundary:** Conceptual articles explain _why_ things work the way they do. The companion cheatsheet (in `cheatsheets/`) covers _how_ to use commands. Don't replicate command lists here.

---

## PHASED EXECUTION PROTOCOL

- PHASE 1: Generate ONLY the index. Stop. Wait for user confirmation before generating any content.
- PHASE 2: Upon "Proceed", generate content one H2 section at a time. Output one section, then stop and wait for "Continue" before generating the next. Follow CONTENT GENERATION SPECIFICATIONS. Resolve all `(→ filename.md)` markers from the index into actual inline markdown links when the concept first appears in content.
- Never skip phases. Never merge index and content in the same response.

---

## FILE NAMING CONVENTION

- Lowercase, hyphen-separated, `.md` extension.
- Tool pages: `[tool-name].md` (e.g., `docker.md`, `kubernetes.md`, `nginx.md`)
- Sub-pages: `[tool-name]-[subtopic].md` (e.g., `kubernetes-networking.md`)
- Cheatsheets live in the sibling `cheatsheets/` directory, not here.

---

## PAGE STRUCTURE (FIXED — ALWAYS IN THIS ORDER)

1. **Title** — `# [Tool Name]`
2. **Prerequisites** — bulleted list. Each bullet has a tier and a context-specific reason:

   - `[Must read]` — page won't make sense without this
   - `[Recommended]` — deepens understanding but page works without it

   Format: `**[Name](relative-link)** [Must read | Recommended] — one sentence on why it matters for THIS tool specifically.`

   ✅ `**[Docker](./docker.md)** [Must read] — Kubernetes orchestrates containers; without understanding container primitives, the Pod model and scheduler behaviour won't click.`
   ❌ `**[Docker](./docker.md)** — Understanding containers.`

3. **Table of Contents** — flat linked list of all H2 sections. Always after Prerequisites.
4. **TLDR** — up to 5 sentences (≤60 words), plain prose, no bullet points. Captures: what the tool is, the core problem it solves, and the key architectural insight. Self-contained.

   ✅ "Docker packages applications and their dependencies into portable containers using Linux namespaces and cgroups for isolation. The key insight is image layering: each Dockerfile instruction creates an immutable layer, making builds reproducible and pushes incremental. Most production issues trace back to misunderstanding layer caching or the distinction between image and container."
   ❌ "This page covers Docker. We will discuss how it works and its failure modes."

Then main content follows.

---

## INDEX FORMAT RULES

- Plain text only. NO markdown code blocks, NO fenced sections.
- Hierarchical dashes: each depth level indented 4 spaces, no numbers, no fixed depth limit.
- Short, crisp phrases only — no sentences, no explanations.
- IMPORTANT: Index is high signal-to-noise only. Zero fluff, zero basic definitions. Content follows progressive disclosure.
- No cross-references like "see the section above" in the index.
- Acronyms free in index. Full definitions in APPENDICES > Acronyms only.
- Vendor-specific implementations: keep bullet generic. Examples belong in content only.
- When a concept has its own page, append `(→ filename.md)` to the bullet as a reminder to inline-link during content generation.

  ✅ `- Layer caching — invalidation rules, COPY ordering`
  ✅ ` - Namespace isolation — PID, net, mnt, UTS`
  ❌ `- Overview of how Docker containers work and why they are useful`

---

## HEADING STYLE RULES

- **Concept / mechanism H3s:** Clean name only — no trailing description. H4 for sub-concepts.
  - ✅ `### Union Filesystem (OverlayFS)` with `#### Layer Merge Strategy` below
  - ❌ `### Union Filesystem — How Layers Are Merged and Why It Matters`
- **Failure mode H3s:** Dash acceptable when mitigation is integral to naming the pattern.
  - ✅ `### Layer Cache Invalidation — Ordering Matters`
- **No heading-as-sentence.** Headings must be crisp noun phrases.
  - ✅ `### Why Multi-Stage Builds Matter`
  - ❌ `### Multi-Stage Builds Are Important For Reducing Image Size`

---

## CONTENT GENERATION SPECIFICATIONS

### Section Structure & Progressive Disclosure

Each H2 section follows this fixed envelope, in this order:

1. **Interviewer TL;DR** — 1–2 sentences. The most important insight about this concept for an interview or on-call situation. Optimized for quick revision.
2. **Mental model** — One sentence. An intuitive anchor before any mechanics.
3. **Body** — Core mechanics → design decisions & alternatives considered → trade-offs, edge cases, failure modes. Depth follows importance.
4. **Callouts** — see Callouts below.
5. **Key Takeaway** — 1–2 sentences. The most important decision or trade-off from this section.

   ✅ "Prefer multi-stage builds over `.dockerignore` alone — stages eliminate build dependencies from the final image entirely, not just from the build context."
   ❌ "Docker images are an important concept and understanding their trade-offs is crucial for production systems."

For important H3 subsections, add a one-line italic insight immediately after the heading:

> _One sentence capturing the core insight before diving in._

---

### Callouts

| Emoji | Name                   | When to use                                                                                  | Frequency                                                                 |
| ----- | ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 🔧    | **Practical Example**  | Minimal config snippet or command sequence that shows the concept in action — not a tutorial | 1–2 per H2 section where a concrete example materially aids understanding |
| 🧠    | **Thought Process**    | Show how a senior engineer reasons from requirements to a tool/config decision               | Where section involves non-obvious reasoning — not mandatory              |
| ⚖️    | **Decision Framework** | X vs Y constraints, trade-off justification, "when would you NOT use this?"                  | ≥1 per section comparing ≥2 design options                                |
| ⚠️    | **Warning / Gotcha**   | Pitfalls, non-obvious failure modes, assumptions that silently break in production           | 1–3 per page max — genuinely non-obvious only                             |

**Interview Lens** — include once per complex H2 section:

```
> 🎯 **Interview Lens**
> **Q:** [Expected interview or on-call question]
> **Ideal answer:** [What a strong candidate/engineer says]
> **Common trap:** [Most frequent wrong answer or wrong framing]
> **Next question:** [Follow-up if candidate answers well]
```

---

### Practical Examples (🔧)

- Use **minimal, illustrative snippets** — enough to show the concept, not a full working config.
- Annotate snippets with inline comments explaining the _why_, not the _what_.
- Placeholders: `app.example.com`, `my-service`, `10.0.0.0/16`, `registry.example.com`.
- Never show real secrets, tokens, or credentials — even as examples.
- Ask: "Does this snippet make the concept click faster than prose?" If not, cut it.

```yaml
# Example: annotated snippet style
spec:
  replicas: 3 # 3 replicas = tolerate 1 failure with majority quorum
  selector:
    matchLabels:
      app: my-service # must match template labels exactly — mismatch = no pods scheduled
```

---

### Definitions

No dictionary-style definitions. Define through purpose and first principle. For unfamiliar terms, add one intuitive one-liner before the deep dive.

### Tables

Use markdown tables for:

- X vs Y trade-off comparisons
- Feature/property matrices across variants or strategies
- Decision criteria grids
- Flag/option comparisons (when ≤4 columns and ≤8 rows)

Keep tables ≤4 columns. Prefer tables over prose for any comparison with 3+ dimensions.

### Diagrams

Plain ASCII or mermaid code blocks. Mandatory for topics where spatial relationships are core to understanding (e.g., Kubernetes control plane topology, Nginx request pipeline, Docker build stages). Minimal and whiteboard-friendly.

### Code & Config

- Fenced code blocks for config snippets, CLI patterns, or diagnostic commands.
- Annotate non-obvious flags or keys with inline comments.
- No full production configs — strip to the essential concept.
- Always ask: does this snippet clarify the concept, or does it just show "how to"? The latter belongs in the cheatsheet.

### Inline Links

Whenever a concept, component, or tool with its own wiki page is referenced:

- First appearance in each section body: wrap in link
- File doesn't exist yet: add `<!-- link: file.md -->` immediately after the reference

Path conventions (from a devops-tools page):

- Same directory (other tools): `./file.md`
- Cheatsheet for this tool: `./cheatsheets/[tool-name].md`
- System design components: `../components/file.md`
- System design algorithms: `../algorithms/file.md`
- HLD pages: `../hld/file.md`

---

## SCOPE MANAGEMENT & STUB PAGES

A tool page covers the tool at the right conceptual depth — enough to understand its architecture and trade-offs, not enough to operate it day-to-day (that belongs in the cheatsheet). When a subtopic grows beyond scope:

**Signals a section has exceeded scope:**

- More than ~2 H2 sections worth of content on a single sub-concept
- Content equally valuable as a standalone article
- Deep operational procedures (backup scripts, full Helm values, production tuning recipes)

**What to do instead:**

1. Create a dedicated stub file (e.g., `kubernetes-networking.md`)
2. Add prerequisite back-link: `**[Parent](./parent.md)** [Must read]`
3. Add `<!-- Partial article — seeded from parent.md. Sections to be completed. -->` in the stub's ToC
4. In parent, replace deep content with 2–3 sentence summary + link to new page
5. In `index.md`, add stub as a commented-out row until the article is complete

Don't discard written content — seed it into the appropriate dedicated page.

---

## STRUCTURE GUIDELINES

- DO NOT prescribe a fixed section order. The tool's nature drives the flow.
- Depth reflects conceptual complexity — not length or interview importance.
- Prerequisites, Table of Contents, TLDR are mandatory upfront (non-negotiable order).
- End with Appendices.
- Unbalanced tree by design: depth = complexity, not symmetry.

**Failure modes follow a two-level pattern:**

- **Inline H3s:** each failure mode within its relevant parent H2, as part of natural flow
- **Dedicated summary H2** (e.g., `## Production Failure Modes & Gotchas`): consolidates all failure modes mentioned inline + additional ones not covered elsewhere. Always present.

---

## SUGGESTED SECTION STARTING POINTS

Pick, merge, and reorder based on the tool. Omit inapplicable sections — never include empty placeholders.

- Architecture Overview & Mental Model
- Core Primitives & Abstractions
- Internals Deep-Dive (how the tool actually works under the hood)
- Configuration Model & Patterns
- Networking & Communication
- Storage & Persistence
- Security Model & Hardening
- Observability & Debugging
- Integration with Other Tools
- Scaling & Performance Considerations
- Production Failure Modes & Gotchas
- Common Interview / On-Call Scenarios
- Appendices

---

## APPENDICES FORMAT

Include only relevant sub-sections. Always placed at the end.

**Acronyms & Abbreviations**
Table format: `Acronym | Full Form | One-line meaning`

Scope: only acronyms for concepts directly and substantially covered in this article.

**Anti-patterns**
Bulleted list. Each entry: `pattern name — why it fails — what to do instead.`

**Key Config Reference** _(optional — only if a config file is central to the tool)_
Table of the most important config keys/flags: `Key / Flag | Default | What it controls | When to change`
Keep to ≤10 rows. Full reference belongs in the cheatsheet.

**Selection Matrix** _(include only if the tool has multiple modes or variants worth comparing)_
Table comparing variants across key decision dimensions (columns = variants, rows = criteria).

---

## CONSTRAINTS

- Every major design decision needs: what alternatives were considered and why rejected.
- NO meta-commentary in index bullets — state concepts only.
- NO redundant nesting: if depth-3 suffices, skip depth-4.
- Within a level, order bullets by logical flow: prerequisites before advanced, common before edge cases, cause before effect.
- One topic per leaf: don't group unrelated concepts under one bullet.
- Practical examples clarify concepts — they are not tutorials. If a snippet needs more than 3 lines of explanation, cut it or move it to the cheatsheet.

---

## SELF-CHECK

**Before outputting Phase 1 (index), verify:**

- [ ] Tree is unbalanced — depth reflects conceptual complexity, not symmetry?
- [ ] All index bullets are crisp phrases — no sentences, no definitions?
- [ ] Concepts with own pages annotated with `(→ filename.md)` in index?
- [ ] Inapplicable sections omitted — no empty placeholders?
- [ ] Index builds progressive complexity: internals → config model → production → gotchas?

If all true → output index → STOP. Wait for user confirmation.

---

**Before outputting each Phase 2 section, run:**

- **TLDR flashcard test:** Can someone use this TLDR standalone as a revision flashcard? If it says "In this article…" or references other sections — rewrite.
- **Key Takeaway sticky-note test:** Would an engineer write this on a post-it? If longer than 2 sentences or repeats the TL;DR — compress.
- **Snippet whiteboard test:** Would you sketch this config on a whiteboard to explain the concept? If not — cut it or move to the cheatsheet.
- **Cheatsheet boundary check:** Does this section contain command lists, full flag references, or step-by-step procedures? If yes — move to cheatsheet, keep only the conceptual anchor here.
