# AI Instructions — HLD Pages

> **Read `_base.md` first.** This file contains only the type-specific rules for high-level design (system design) articles.

---

## TOPIC

[INSERT SYSTEM, e.g., "Design Twitter", "Design a URL Shortener", "Design a Payment System"]

---

## NEVER

In addition to the shared NEVER rules in `_base.md`:

- Use standards-body URNs, IANA identifiers, or proprietary strings in examples — use simple readable placeholders instead
- Include full function or class implementations in code blocks — pseudocode or prose only; implementations belong in dedicated component/algorithm pages

---

## GOALS & AUDIENCE

- **Goal:** Interview prep (end-to-end system walkthrough, trade-offs, scaling decisions, failure modes) + production-grade architectural mastery
- **Persona:** Senior system design interviewer and technical architect
- **Audience:** Engineers with adjacent knowledge. Self-contained — no external resources required.
- **Approach:** Progressive disclosure — intuitive mental models → architectural decisions → production trade-offs & interview defense.

---

## PHASED EXECUTION PROTOCOL

Extends the standard 2-phase protocol from `_base.md` with an additional PHASE 0:

- **PHASE 0:** Before writing the index, complete this sentence internally: \_"The core architectural challenge of [System] is _\_\_."_ Let that thesis drive which section gets the deepest nesting, and ensure it appears explicitly in the TLDR.
- **PHASE 1:** Generate ONLY the index. Stop. Wait for user confirmation before generating any content.
- **PHASE 2:** Upon "Proceed", generate content one H2 section at a time. Output one section, stop, wait for "Continue" before the next. Resolve all `(→ filename.md)` markers into actual inline markdown links when the concept first appears.
- Never skip phases. Never merge index and content in the same response.

---

## FILE NAMING CONVENTION

- Lowercase, hyphen-separated, `.md` extension.
- HLD pages: `[system-name].md` (e.g., `url-shortener.md`, `twitter-news-feed.md`)
- Sub-pages: `[system-name]-[subtopic].md` (e.g., `url-shortener-interview-scenarios.md`)

---

## PAGE STRUCTURE (FIXED — ALWAYS IN THIS ORDER)

1. **Title** — `# Design: [System Name]`
2. **Prerequisites** — bulleted list. Each bullet: tier + one sentence on why it matters for THIS system specifically.
   - ✅ `**[Consistent Hashing](../algorithms/consistent-hashing.md)** [Must read] — the URL shortener's redirect service uses consistent hashing to route short codes to shards; without this, the sharding section won't make sense.`
   - ❌ `**[Consistent Hashing](../algorithms/consistent-hashing.md)** — Knowledge of consistent hashing.`
3. **Table of Contents** — flat linked list of all H2 sections. Always after Prerequisites.
4. **TLDR** — up to 5 sentences (≤50 words), plain prose, no bullet points. Captures the core architecture decision and key trade-off. Must reflect the system thesis identified in Phase 0.
   - ✅ "A URL shortener maps long URLs to short codes and redirects users at high read volume. The core challenge is generating unique, collision-free short codes at scale while keeping redirect latency under 10ms. Write path uses a distributed ID generator; read path is a cache-heavy lookup with consistent hashing for shard routing."
   - ❌ "This page designs a URL shortener. We will cover the requirements, architecture, database design, and failure modes of the system."

Then the main content follows.

---

## INDEX FORMAT RULES — Examples

Rules are in `_base.md`. Type-specific examples:

✅ `- Short code generation — collision avoidance at scale`
✅ ` - Hot shard — key salting, adaptive routing`
❌ `- Overview of how the system generates short URLs`
❌ ` - Discussion of failure modes in the sharding layer`

---

## HEADING STYLE RULES — Examples

Rules are in `_base.md`. Type-specific examples:

- ✅ `### Write-Ahead Log` with `#### Crash Recovery` below
- ❌ `### Write-Ahead Log — Crash Recovery & Durability Guarantees`
- ✅ `### Hot Partition — Key Salting, Adaptive Routing`
- No heading-as-sentence.

---

## CONTENT GENERATION SPECIFICATIONS

Section structure, callouts, definitions, tables, vendor examples are in `_base.md`.

### Capacity Estimation

Always follow this order: DAU → QPS → Storage → Bandwidth.

```
**Users:** [X] DAU, [Y] MAU
**Read/Write ratio:** [X:Y]
**Peak QPS:** [writes/s] writes, [reads/s] reads
**Storage:** [per-record size] × [records/day] × [retention] = [total]
**Bandwidth:** [avg request size] × [peak QPS] = [ingress/egress]
**Key constraint:** [the dominant number that forces a scaling decision]
```

Keep estimation rough — ±1 order of magnitude is fine. Goal is to identify the dominant constraint, not achieve precision.

### Diagrams

Plain ASCII or mermaid code blocks. Minimal and interview-whiteboard-friendly.

### Code / Config

Only where directly relevant (e.g., schema design, API contracts, queue config). Short pseudocode when logic sticks faster than prose. No full function implementations — those belong in component/algorithm pages. If it wouldn't be on an interview whiteboard, cut it.

### Inline Links — Path Conventions

From an HLD page:

- Same directory: `./file.md`
- Components: `../components/file.md`
- Algorithms: `../algorithms/file.md`
- Other HLD pages: `../hld/file.md`

---

## STRUCTURE GUIDELINES

- DO NOT prescribe a fixed section order. System's nature drives the flow.
- Depth reflects conceptual complexity — the more layered and nuanced a subsystem, the deeper it nests.
- Prerequisites, Table of Contents, TLDR are mandatory upfront (that order — non-negotiable).
- End with Trade-off Summary, then Appendices.
- Unbalanced tree by design: depth = complexity, not symmetry.

**Failure modes follow a two-level pattern:**

- **Inline H3s:** each failure mode is an H3 within its relevant parent H2, as part of natural flow
- **Dedicated summary H2** (e.g., `## Production Failure Modes & Gotchas`): consolidates all failure modes mentioned inline + additional ones. Always present. Primary interview revision target.

---

## SUGGESTED SECTION STARTING POINTS

Pick, merge, and reorder based on the system. Omit inapplicable sections — never include empty placeholders.

- Requirements & Scope Clarification (functional, non-functional, out of scope)
- Capacity Estimation (traffic, storage, bandwidth, scaling inflection points)
- High-Level Architecture (component diagram, read path, write path)
- Data Model & Storage (schema, storage engine selection, sharding strategy)
- Core Service Design (key services, API contracts, critical algorithms)
- Reliability & Fault Tolerance (failure modes, replication, failover, consistency)
- Scalability & Performance (bottlenecks, caching strategy, read/write scaling)
- Deep-Dive: [Most Interview-Critical Subsystem]
- Observability (key metrics, SLOs, alerting)
- Trade-off Summary (decision log: chosen vs rejected and why)
- Common Interview Gotchas
- Appendices
- Interview Scenario Bank

---

## TRADE-OFF SUMMARY FORMAT

Dedicated H2 section placed before Appendices. A decision log — not prose, not re-explanation. One row per major architectural decision.

| Decision              | Options Considered                           | Choice       | Why                                                        |
| --------------------- | -------------------------------------------- | ------------ | ---------------------------------------------------------- |
| Short code generation | Base62 hash, auto-increment ID, Snowflake ID | Snowflake ID | Globally unique, no coordination needed, naturally ordered |

One row = one decision. Keep "Why" to one sentence. Cover only decisions where the rejected option was genuinely reasonable.

---

## APPENDICES FORMAT

Base sections (Acronyms, Anti-patterns, Selection Matrix) are in `_base.md`. No additional appendix sections for HLD.

---

## SELF-CHECK

### Phase 1 — Before outputting the index, verify:

- [ ] System thesis identified and reflected in deepest section?
- [ ] Tree is unbalanced — depth reflects conceptual complexity, not symmetry?
- [ ] All index bullets are crisp phrases — no sentences, no definitions?
- [ ] Concepts with own pages annotated with `(→ filename.md)` in index?
- [ ] Inapplicable sections omitted — no empty placeholders?
- [ ] Index builds progressive complexity: system intuition → architectural decisions → production reality → interview defense?

If all true → output index → STOP. Wait for user confirmation.

### Phase 2 — Additional checks beyond `_base.md`:

Standard Phase 2 checks from `_base.md` apply. No additional checks for this type.
