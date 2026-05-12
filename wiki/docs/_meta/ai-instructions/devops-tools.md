# AI Instructions — DevOps Tools Pages

> **Read `_base.md` first.** This file contains only the type-specific rules for DevOps tool conceptual articles.

---

## TOPIC

[INSERT TOOL, e.g., "Docker", "Kubernetes", "Nginx", "Terraform", "Git"]

---

## NEVER

In addition to the shared NEVER rules in `_base.md`:

- Include full production-grade configs or scripts — minimal illustrative snippets only
- Use real hostnames, IPs, or sensitive strings in examples — use readable placeholders (e.g., `app.example.com`, `my-service`, `10.0.0.0/16`)
- Duplicate content that belongs in the cheatsheet — reference it instead

---

## GOALS & AUDIENCE

- **Goal:** Conceptual mastery of how the tool works internally, its design decisions, and trade-offs — bridged with practical examples that show concepts in action
- **Persona:** Senior DevOps/platform engineer and technical educator
- **Audience:** Engineers who use or encounter the tool but haven't studied its internals. Self-contained — no external resources required.
- **Approach:** Mental model → architecture & internals → core primitives → practical examples → production trade-offs & operational gotchas.
- **Scope boundary:** Conceptual articles explain _why_ things work the way they do. The companion cheatsheet (in `cheatsheets/`) covers _how_ to use commands. Don't replicate command lists here.

---

## PHASED EXECUTION PROTOCOL

Standard 2-phase protocol from `_base.md`. No additions.

---

## FILE NAMING CONVENTION

- Lowercase, hyphen-separated, `.md` extension.
- Tool pages: `[tool-name].md` (e.g., `docker.md`, `kubernetes.md`, `nginx.md`)
- Sub-pages: `[tool-name]-[subtopic].md` (e.g., `kubernetes-networking.md`)
- Cheatsheets live in the sibling `cheatsheets/` directory, not here.

---

## PAGE STRUCTURE (FIXED — ALWAYS IN THIS ORDER)

1. **Title** — `# [Tool Name]`
2. **Prerequisites** — bulleted list. Each bullet: tier + one sentence on why it matters for THIS tool specifically.
   - ✅ `**[Docker](./docker.md)** [Must read] — Kubernetes orchestrates containers; without understanding container primitives, the Pod model and scheduler behaviour won't click.`
   - ❌ `**[Docker](./docker.md)** — Understanding containers.`
3. **Table of Contents** — flat linked list of all H2 sections. Always after Prerequisites.
4. **TLDR** — up to 5 sentences (≤60 words), plain prose, no bullet points. What the tool is, the core problem it solves, and the key architectural insight. Self-contained.
   - ✅ "Docker packages applications and their dependencies into portable containers using Linux namespaces and cgroups for isolation. The key insight is image layering: each Dockerfile instruction creates an immutable layer, making builds reproducible and pushes incremental. Most production issues trace back to misunderstanding layer caching or the distinction between image and container."
   - ❌ "This page covers Docker. We will discuss how it works and its failure modes."

Then main content follows.

---

## INDEX FORMAT RULES — Examples

Rules are in `_base.md`. Type-specific examples:

✅ `- Layer caching — invalidation rules, COPY ordering`
✅ ` - Namespace isolation — PID, net, mnt, UTS`
❌ `- Overview of how Docker containers work and why they are useful`

---

## HEADING STYLE RULES — Examples

Rules are in `_base.md`. Type-specific examples:

- ✅ `### Union Filesystem (OverlayFS)` with `#### Layer Merge Strategy` below
- ❌ `### Union Filesystem — How Layers Are Merged and Why It Matters`
- ✅ `### Layer Cache Invalidation — Ordering Matters`
- ✅ `### Why Multi-Stage Builds Matter`
- ❌ `### Multi-Stage Builds Are Important For Reducing Image Size`

---

## CONTENT GENERATION SPECIFICATIONS

Section structure, callouts (🧠/⚖️/⚠️), definitions, tables, vendor examples are in `_base.md`. This type adds the 🔧 callout.

### Callouts — Additional

| Emoji | Name                  | When to use                                                                                  | Frequency                                                                 |
| ----- | --------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 🔧    | **Practical Example** | Minimal config snippet or command sequence that shows the concept in action — not a tutorial | 1–2 per H2 section where a concrete example materially aids understanding |

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

### Code & Config

- Fenced code blocks for config snippets, CLI patterns, or diagnostic commands.
- Annotate non-obvious flags or keys with inline comments.
- No full production configs — strip to the essential concept.
- Always ask: does this snippet clarify the concept, or does it just show "how to"? The latter belongs in the cheatsheet.

### Diagrams

Plain ASCII or mermaid code blocks. Mandatory for topics where spatial relationships are core to understanding (e.g., Kubernetes control plane topology, Nginx request pipeline, Docker build stages). Minimal and whiteboard-friendly.

### Inline Links — Path Conventions

From a devops-tools page:

- Same directory (other tools): `./file.md`
- Cheatsheet for this tool: `./cheatsheets/[tool-name].md`
- System design components: `../components/file.md`
- System design algorithms: `../algorithms/file.md`
- HLD pages: `../hld/file.md`

---

## SCOPE MANAGEMENT & STUB PAGES

A tool page covers the tool at the right conceptual depth — enough to understand its architecture and trade-offs, not enough to operate it day-to-day (that belongs in the cheatsheet).

**Signals a section has exceeded scope:**

- More than ~2 H2 sections worth of content on a single sub-concept
- Content equally valuable as a standalone article
- Deep operational procedures (backup scripts, full Helm values, production tuning recipes)

**What to do instead:**

1. Create a dedicated stub file (e.g., `kubernetes-networking.md`)
2. Add prerequisite back-link: `**[Parent](./parent.md)** [Must read]`
3. Add `<!-- Partial article — seeded from parent.md. Sections to be completed. -->` in the stub's ToC
4. In parent, replace deep content with 2–3 sentence summary + link to new page
5. In `index.md`, add stub as a commented-out row until complete

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
- **Dedicated summary H2** (e.g., `## Production Failure Modes & Gotchas`): consolidates all failure modes mentioned inline + additional ones. Always present.

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

Base sections (Acronyms, Anti-patterns, Selection Matrix) are in `_base.md`. Additional section for this type:

**Key Config Reference** _(optional — only if a config file is central to the tool)_
Table of the most important config keys/flags: `Key / Flag | Default | What it controls | When to change`
Keep to ≤10 rows. Full reference belongs in the cheatsheet.

---

## CONSTRAINTS

Shared constraints are in `_base.md`. Additional for this type:

- Practical examples clarify concepts — they are not tutorials. If a snippet needs more than 3 lines of explanation, cut it or move it to the cheatsheet.

---

## SELF-CHECK

### Phase 1 — Before outputting the index, verify:

- [ ] Tree is unbalanced — depth reflects conceptual complexity, not symmetry?
- [ ] All index bullets are crisp phrases — no sentences, no definitions?
- [ ] Concepts with own pages annotated with `(→ filename.md)` in index?
- [ ] Inapplicable sections omitted — no empty placeholders?
- [ ] Index builds progressive complexity: internals → config model → production → gotchas?

If all true → output index → STOP. Wait for user confirmation.

### Phase 2 — Additional checks beyond `_base.md`:

- **Snippet whiteboard test:** Would you sketch this config on a whiteboard to explain the concept? If not — cut it or move to the cheatsheet.
- **Cheatsheet boundary check:** Does this section contain command lists, full flag references, or step-by-step procedures? If yes — move to cheatsheet, keep only the conceptual anchor here.
