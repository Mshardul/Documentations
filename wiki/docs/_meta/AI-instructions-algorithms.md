# AI Instructions — Algorithms & Concepts Pages

## TOPIC

[INSERT TOPIC, e.g., "CAP Theorem", "Consistent Hashing", "ACID vs BASE", "Bloom Filter"]

---

## NEVER

- Start a section with "In this section, we will…" or "This page covers…"
- Define a term inline if it has its own linked page — link it instead
- Generate symmetric section depth — depth must reflect complexity, not balance
- Use "important", "note that", or "it is worth mentioning" as padding
- Repeat the Interviewer TL;DR verbatim in the Key Takeaway
- Open with history or evolution of the concept
- Include formal notation, ε-δ proofs, or full inductive proofs

---

## GOALS & AUDIENCE

- **Goal:** Interview prep (trade-offs, application to system design, reasoning under constraints) + deep conceptual mastery
- **Persona:** Senior system design educator and technical writer
- **Audience:** Engineers with adjacent knowledge. Self-contained — no external resources required. Prerequisites handle foundational onboarding.
- **Approach:** Intuition-first progressive disclosure — mental model → formal definition → mechanics → variants → real-world application → production trade-offs & interview scenarios.

---

## PHASED EXECUTION PROTOCOL

- PHASE 1: Generate ONLY the index. Stop. Output: "[AWAITING CONFIRMATION TO GENERATE CONTENT]"
- PHASE 2: Upon "Proceed", generate content one H2 section at a time. Output one section, then stop and wait for "Continue" before generating the next. Follow CONTENT GENERATION SPECIFICATIONS. Resolve all `(→ filename.md)` markers from the index into actual inline markdown links when the concept first appears in content.
- Never skip phases. Never merge index and content in the same response.

---

## FILE NAMING CONVENTION

- Lowercase, hyphen-separated, `.md` extension.
- Algorithm/concept pages: `[topic-name].md` (e.g., `cap-theorem.md`, `consistent-hashing.md`, `bloom-filter.md`)
- Sub-pages: `[parent-topic]-[subtopic].md` (e.g., `cap-theorem-interview-scenarios.md`)

---

## PAGE STRUCTURE (FIXED — ALWAYS IN THIS ORDER)

1. **Title** — `# [Concept Name]`
2. **Prerequisites** — bulleted list. Each bullet has a tier and a context-specific reason:

   - `[Must read]` — page won't make sense without this
   - `[Recommended]` — deepens understanding but page works without it

   Format: `**[Name](relative-link)** [Must read | Recommended] — one sentence on why it matters for THIS concept specifically.`

   ✅ `**[Consistency Models](./consistency-models.md)** [Must read] — CAP's "C" maps directly to linearizability; without this, the theorem's guarantees will be misread as weaker than they are.`
   ❌ `**[Consistency Models](./consistency-models.md)** — Knowledge of consistency.`

3. **Table of Contents** — flat linked list of all H2 sections. Always after Prerequisites.
4. **TLDR** — up to 5 sentences (≤50 words), plain prose, no bullet points. Captures: what the concept is, the core insight, and the key design trade-off it implies. Self-contained — reader understands the essence without reading anything else.

   ✅ "CAP Theorem states that a distributed system can guarantee at most two of: Consistency, Availability, and Partition Tolerance. Since network partitions are unavoidable in practice, the real trade-off is C vs A during a partition. CA systems don't exist at scale — systems choose CP (return error on partition) or AP (return stale data)."
   ❌ "This page covers CAP Theorem. We will discuss what it means, its implications, and common misconceptions about it."

Then the main content follows.

---

## INDEX FORMAT RULES

- Plain text only. NO markdown code blocks, NO fenced sections.
- Hierarchical numbering: 1, 1.1, 1.1.1 (depth scales to importance, no fixed limit).
- Short, crisp phrases only — no sentences, no explanations.
- Indent 4 spaces per level.
- IMPORTANT: Index is high signal-to-noise only. Zero fluff, zero basic definitions. Content follows progressive disclosure (see CONTENT GENERATION SPECIFICATIONS).
- No cross-references like "see section 4.2" in the index.
- Acronyms free in index. Full definitions in APPENDICES > Acronyms only.
- Vendor-specific implementations: keep bullet generic. Examples belong in content only.
- When a concept has its own page, append `(→ filename.md)` to the bullet as a reminder to inline-link during content generation.

  ✅ `1.1 Partition tolerance — why it's non-negotiable`
  ✅ `3.2.1 PACELC — latency/consistency trade-off beyond CAP`
  ❌ `1.1 Overview of the three CAP properties and what they mean`
  ❌ `3.2.1 Discussion of extensions to CAP and their practical implications`

---

## HEADING STYLE RULES

- **Concept / algorithm H3s:** Clean name only — no trailing description. H4 for sub-concepts.
  - ✅ `### PACELC Model` with `#### Latency vs Consistency` below
  - ❌ `### PACELC Model — Latency and Consistency Beyond CAP`
- **Failure mode / gotcha H3s:** Dash acceptable when mitigation is integral to naming the pattern.
  - ✅ `### Split-Brain — Quorum Fencing`
- **No heading-as-sentence.** Headings must be crisp noun phrases.
  - ✅ `### Why CA Systems Don't Exist at Scale`
  - ❌ `### CA Systems Do Not Exist at Scale Because Partitions Are Inevitable`

---

## CONTENT GENERATION SPECIFICATIONS

### Section Structure & Progressive Disclosure

Each H2 section follows this fixed envelope, in this order:

1. **Interviewer TL;DR** — 1-2 sentences. The single most important thing to say in an interview. Optimized for quick revision.
2. **Mental model** — One sentence. An intuitive anchor: what this concept IS before any formalism.
3. **Body** — Intuition → formal definition → mechanics → variants → failure modes and edge cases. Depth follows importance.
4. **Callouts** — Interview Lens and Decision Framework where applicable (see Callouts below).
5. **Key Takeaway** — 1-2 sentences. The most important insight or design implication from this section.

   ✅ "In practice, CA is not a real option — network partitions happen. The choice is always CP vs AP, and it should be made per-operation, not per-system."
   ❌ "CAP Theorem is an important concept with many trade-offs that engineers need to understand when building distributed systems."

For important H3 subsections, add a one-line italic TLDR immediately after the heading:

> _One sentence capturing the core insight before diving in._

---

### Proof Sketches

Include a proof sketch **only when the argument itself is the insight** — when knowing _why_ the theorem holds changes how you design systems.

- **Include when:** the result is non-obvious and the argument reveals an architectural constraint (e.g., CAP — network partition forces a C/A choice; FLP — single crash can stall consensus)
- **Skip when:** the mechanism is more important than the proof, or the intuition is sufficient (e.g., LRU eviction, consistent hashing ring)

Rules when included:

- Use intuitive argument only — no formal notation, no induction
- One paragraph max
- Frame as "why this must be true" not "here is the proof"

---

### Callouts

| Emoji | Name                   | When to use                                                                                                      | Frequency                                              |
| ----- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 🧠    | **Thought Process**    | Show how a senior engineer reasons from the concept to a design decision                                         | ≥1 per major H2 section                                |
| ⚖️    | **Decision Framework** | X vs Y constraints, trade-off justification, "when would you NOT apply this?"                                    | ≥1 per section comparing ≥2 variants or design options |
| ⚠️    | **Warning / Gotcha**   | Non-obvious misapplications, common misreadings of the theorem/concept, assumptions that silently break at scale | 1–3 per page max — genuinely non-obvious gotchas only  |

**Interview Lens** — include once per complex H2 section, using this exact format:

```
> 🎯 **Interview Lens**
> **Q:** [Expected interview question]
> **Ideal answer:** [What a strong candidate says — not just correct, but framed well]
> **Common trap:** [The most frequent wrong answer or wrong framing]
> **Next question:** [The follow-up the interviewer asks if the candidate answers well]
```

---

### Analogy

For abstract theorems and formal concepts, lead with one concrete real-world analogy before the mental model. The analogy must map directly to the key trade-off — not just the name.

✅ "CAP = a bank branch during a network outage: stop serving customers (CP) or serve with possibly stale balances (AP)."
❌ "CAP is like choosing between different priorities in a system."

---

### Formal Definition

State the formal definition in plain English. If the concept has a canonical statement (e.g., Brewer's theorem), quote it then immediately restate in plain English. 1 sentence preferred, 1–3 max (≤30 words). No notation.

---

### Definitions

No dictionary-style definitions. Define through purpose and first principle. For unfamiliar terms, add one intuitive one-liner before the deep dive. Formal definitions come after, not before, intuition.

### Variants & Extensions

When a concept has meaningful variants (e.g., CAP → PACELC; consistency models → strong/eventual/causal):

- Compare variants using a table when 3+ dimensions exist
- Order: common case first, then extensions and edge cases
- Avoid listing every variant — only those with distinct design implications

### Often Confused With

When a concept is commonly conflated with another (e.g., CAP vs PACELC, ACID vs BASE, linearizability vs serializability), include direct disambiguation before variants, after core mechanics. Use a table if 3+ dimensions differ. Frame as "X focuses on **_, Y focuses on _**" — not as corrections.

### Tables

Use markdown tables for:

- Variant comparisons (e.g., CP vs AP systems, strong vs eventual consistency)
- Trade-off matrices across design options
- Concept property grids (e.g., which consistency model guarantees which properties)

Keep tables ≤4 columns. Prefer tables over prose for any comparison with 3+ dimensions.

### Complexity & Formal Properties

For algorithms with meaningful complexity characteristics (time, space, error bounds, false positive rates):

- State bounds plainly in prose or a small inline table
- No derivations — just the result and what it means for system design
- Always connect to the practical implication: "O(1) lookup means this scales to billions of keys without latency growth"

### Diagrams

Plain ASCII or mermaid code blocks. Mandatory when spatial relationships or state transitions are core to understanding (e.g., consistent hashing ring, CAP triangle, Bloom filter bit array). Minimal and interview-whiteboard-friendly.

### Code & Config

Only where directly relevant — pseudocode when the algorithm logic sticks faster than prose (e.g., Bloom filter insert/lookup). Always brief. Never include production boilerplate.

### Vendor Examples

Core explanation generic. Mention 1-2 well-known real-world applications as examples (e.g., Cassandra for AP, HBase for CP) without deep comparison. No proprietary details.

### Inline Links

Whenever a concept, component, or algorithm with its own wiki page is referenced:

- In prerequisites: `**[Name](relative-link)** — one sentence on why it matters here`
- First appearance in each section body: wrap in link
- File doesn't exist yet: add `<!-- link: file.md -->` immediately after the reference

Path conventions (from an algorithms/concepts page):

- Same directory: `./file.md`
- Components: `../components/file.md`
- Other algorithms: `../algorithms/file.md`
- HLD pages: `../hld/file.md`

---

## STRUCTURE GUIDELINES

- DO NOT prescribe a fixed section order. Concept's nature drives the flow.
- Depth reflects conceptual complexity — the more layered and nuanced a concept, the deeper it nests. Not a proxy for length or interview importance.
- Prerequisites, Table of Contents, TLDR are mandatory upfront (that order — non-negotiable).
- End with Appendices.
- Unbalanced tree by design: depth = complexity, not symmetry.

**Failure modes follow a two-level pattern:**

- **Inline H3s:** each failure mode or misapplication is an H3 within its relevant parent H2, as part of natural flow
- **Dedicated summary H2** (e.g., `## Common Misapplications & Gotchas`): consolidates all failure modes and misconceptions mentioned inline + additional ones not covered elsewhere. Always present. Primary interview revision target.

**When This Applies** (when to apply / when not to / how to choose between variants) — place after Core Mechanics, not before. Readers understand the trade-offs better once they understand the concept.

**Assumptions & Preconditions** — for theorems and formal concepts, include a named subsection or H3 covering: what must be true for this concept to hold, and what breaks when those assumptions are violated. This is distinct from failure modes — it's the boundary conditions of the concept itself.

✅ CAP assumes asynchronous network (no timing guarantees). Under synchronous networks, CA is theoretically achievable.
✅ Bloom filter assumes acceptable false positive rate > 0. Zero-FPR requirement invalidates the data structure entirely.

---

## SUGGESTED SECTION STARTING POINTS

Pick, merge, and reorder based on the topic. Omit inapplicable sections — never include empty placeholders.

- Mental Model & Intuition (the "aha" before the formalism)
- Formal Definition (precise statement — after intuition, never before)
- Assumptions & Preconditions (boundary conditions; what breaks when violated)
- Core Mechanics / How It Works
- Often Confused With (disambiguation — include when conflation is common)
- Variants & Extensions
- When This Applies (use cases, constraints, decision guide)
- Real-World Applications (how production systems use this concept)
- Performance & Complexity (bounds, scaling behavior, resource implications)
- Common Misapplications & Gotchas
- Appendices
- Interview Scenario Bank

---

## APPENDICES FORMAT

Include only the sub-sections relevant to the topic. Always placed at the end of the page.

**Acronyms & Abbreviations**
Table format: `Acronym | Full Form | One-line meaning`

**Anti-patterns**
Bulleted list. Each entry: `pattern name — why it fails — what to do instead.`

**Selection Matrix** _(include only if topic has multiple meaningful variants worth comparing)_
Table comparing variants across key decision dimensions (columns = variants, rows = criteria).

---

## CONSTRAINTS

- Every major insight must connect to a concrete design decision or trade-off. If a section doesn't answer "so what when building a system?" — it doesn't belong.
- Every major design implication needs: what alternatives exist and why this concept forces a choice.
- NO meta-commentary in index bullets (e.g., "trade-offs discussed here") — state concepts only.
- NO redundant nesting: if 1.1.1 suffices, skip 1.1.1.1.
- Within a level, order bullets by logical flow: intuition before formalism, common case before edge case, cause before effect.
- One topic per leaf: don't group unrelated concepts under one bullet.

---

## SELF-CHECK

**Before outputting Phase 1 (index), verify:**

- [ ] Tree is unbalanced — depth reflects conceptual complexity, not symmetry?
- [ ] All index bullets are crisp phrases — no sentences, no definitions?
- [ ] Concepts with own pages annotated with `(→ filename.md)` in index?
- [ ] Inapplicable sections omitted — no empty placeholders?
- [ ] Index builds progressive complexity: intuition → formal definition → mechanics → variants → real-world application → interview defense?

If all true → output index → append "[AWAITING CONFIRMATION TO GENERATE CONTENT]" → STOP.

---

**Before outputting each Phase 2 section, run:**

- **TLDR flashcard test:** Can someone use this TLDR standalone as an interview flashcard? If it says "In this article…", "We will cover…", or references other sections — rewrite.
- **Key Takeaway sticky-note test:** Would a candidate write this on a post-it? If it's longer than 2 sentences or repeats the Interviewer TL;DR — compress it.
- **Proof sketch test:** Does the proof sketch illuminate a design insight, or is it just formalism? If the latter — cut it.
