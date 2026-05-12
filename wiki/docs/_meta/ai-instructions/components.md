# AI Instructions — Component Pages

> **Read `_base.md` first.** This file contains only the type-specific rules for system design component articles.

---

## TOPIC

[INSERT TOPIC, e.g., "Load Balancer", "Consistent Hashing", "Circuit Breaker"]

---

## NEVER

In addition to the shared NEVER rules in `_base.md`:

- Use standards-body URNs, IANA identifiers, or proprietary strings in examples — use simple readable placeholders (e.g., `acr=basic`, `acr=mfa`) instead

---

## GOALS & AUDIENCE

- **Goal:** Interview prep (trade-offs, debugging, scenario design) + production-grade conceptual mastery
- **Persona:** Senior system design educator and technical writer
- **Audience:** Engineers with adjacent knowledge (e.g., knows k8s but not CDN). Self-contained — no external resources required. Prerequisites handle foundational onboarding.
- **Approach:** Progressive disclosure — intuitive mental models → technical mechanics → production trade-offs & interview scenarios.

---

## PHASED EXECUTION PROTOCOL

Standard 2-phase protocol from `_base.md`. No additions.

---

## FILE NAMING CONVENTION

- Lowercase, hyphen-separated, `.md` extension.
- Component pages: `[topic-name].md` (e.g., `cap-theorem.md`, `load-balancer.md`)
- Sub-pages: `[parent-topic]-[subtopic].md` (e.g., `load-balancer-interview-scenarios.md`)

---

## PAGE STRUCTURE (FIXED — ALWAYS IN THIS ORDER)

1. **Title** — `# [Component Name]`
2. **Prerequisites** — bulleted list. Each bullet: tier + one sentence on why it matters for THIS topic specifically.
   - ✅ `**[Caching](../components/caching.md)** [Must read] — CDN edge nodes are caching layers; TTL mechanics directly determine the staleness behaviour covered throughout this page.`
   - ❌ `**[Caching](../components/caching.md)** — Understanding of caching concepts.`
3. **Table of Contents** — flat linked list of all H2 sections. Always after Prerequisites.
4. **TLDR** — up to 5 sentences (≤50 words), plain prose, no bullet points. What the component is, the core architectural decision it enables, and the key trade-off. Self-contained.
   - ✅ "A load balancer distributes incoming traffic across backend servers to prevent overload and maximise availability. The critical choice is L4 vs L7: L4 routes by IP/TCP (fast, minimal overhead), L7 routes by HTTP content (slower, but enables sticky sessions, smart health checks, and content-aware routing). Most production systems use L7 for the flexibility."
   - ❌ "This page covers load balancers. We will discuss how they work, their types, and failure modes. Load balancers are an important component in distributed systems."

Then the main content follows.

---

## INDEX FORMAT RULES — Examples

Rules are in `_base.md`. Type-specific examples:

✅ `- L4 vs L7 — routing granularity trade-offs`
✅ ` - Split-brain — quorum, fencing`
❌ `- Overview of what load balancers do and why they are needed`
❌ ` - Discussion of various failure modes and how to handle them`

---

## HEADING STYLE RULES — Examples

Rules are in `_base.md`. Type-specific examples:

- ✅ `### LRU (Least Recently Used)` with `#### Mechanics` and `#### Scan Resistance Problem` below
- ❌ `### LRU — Mechanics, Scan Resistance Problem`
- ✅ `### Cache Avalanche — Staggered TTL, Circuit Breaker on Origin`
- ✅ `### Why Cache Invalidation Is Hard`
- ❌ `### Invalidation Is the Hard Problem — Why TTL Alone Isn't Enough`

---

## CONTENT GENERATION SPECIFICATIONS

Section structure, callouts, definitions, tables, vendor examples are in `_base.md`.

### Code & Config

Fenced code blocks for config patterns, API contracts, schema design, or CLI diagnostics. Short pseudocode when logic sticks faster than prose. No full function implementations — if the how-to-implement detail matters, it belongs on a dedicated page. Always ask: would this be on a whiteboard in a system design interview? If not, cut it.

### Diagrams

Plain ASCII or mermaid code blocks. Mandatory for topics where spatial relationships are core to understanding (e.g., consistent hashing ring, load balancer traffic flow, CDN edge topology). Minimal and interview-whiteboard-friendly.

### Inline Links — Path Conventions

From a component page:

- Same directory: `./file.md`
- Other components: `../components/file.md`
- Algorithms: `../algorithms/file.md`
- HLD pages: `../hld/file.md`

---

## SCOPE MANAGEMENT & STUB PAGES

A component page covers a topic at the right depth — enough to understand it fully and make trade-off decisions, not enough to implement it.

**Signal that a section has exceeded its scope:**

- More than ~2 H2 sections worth of content on a single sub-concept (e.g., JWT structure, mTLS PKI)
- Content that is equally valuable as a standalone article
- Deep implementation details (algorithm internals, PKI operations, cryptographic parameters)

**What to do instead of trimming:**

1. Create a dedicated stub file (e.g., `jwt.md`, `mtls.md`) seeded with the content
2. Add prerequisite back-link: `**[Parent](./parent.md)** [Must read]`
3. Add `<!-- Partial article — seeded from parent.md. Sections to be completed. -->` in the stub's Table of Contents
4. In the parent article, replace deep content with a 2–3 sentence summary + link to the new page
5. In `index.md`, add the stub as a commented-out row until the article is complete

Don't discard written content — seed it into the appropriate dedicated page.

---

## STRUCTURE GUIDELINES

- DO NOT prescribe a fixed section order. Topic's nature drives the flow.
- Depth reflects conceptual complexity — the more layered and nuanced a concept, the deeper it nests.
- Prerequisites, Table of Contents, TLDR are mandatory upfront (that order — non-negotiable).
- End with Appendices.
- Unbalanced tree by design: depth = complexity, not symmetry.

**Failure modes follow a two-level pattern:**

- **Inline H3s:** each failure mode is an H3 within its relevant parent H2, as part of natural flow
- **Dedicated summary H2** (e.g., `## Production Failure Modes & Gotchas`): consolidates all failure modes mentioned inline + additional ones not covered elsewhere. Always present. Primary interview revision target.

**Quick Decision Guide** — place after Core Mechanisms, not before. Readers understand trade-offs better once they understand the mechanics.

---

## SUGGESTED SECTION STARTING POINTS

Pick, merge, and reorder based on the topic. Omit inapplicable sections — never include empty placeholders.

- Quick Decision Guide (when to use, when not to, how to choose between variants)
- Conceptual Foundations & Mental Models
- Core Mechanisms / Algorithms / Patterns
- Resilience & Failure Handling
- Security & Hardening
- Performance & Optimization
- Deployment Contexts & Modern Architectures
- Observability & Debugging
- Advanced Patterns & Strategies
- Production Issues & Troubleshooting
- Common Interview Gotchas
- Appendices
- Interview Scenario Bank

---

## SELF-CHECK

### Phase 1 — Before outputting the index, verify:

- [ ] Tree is unbalanced — depth reflects conceptual complexity, not symmetry?
- [ ] All index bullets are crisp phrases — no sentences, no definitions?
- [ ] Concepts with own pages annotated with `(→ filename.md)` in index?
- [ ] Inapplicable sections omitted — no empty placeholders?
- [ ] Index builds progressive complexity: intuition → mechanics → production → interview defense?

If all true → output index → STOP. Wait for user confirmation.

### Phase 2 — Additional checks beyond `_base.md`:

Standard Phase 2 checks from `_base.md` apply. No additional checks for this type.
