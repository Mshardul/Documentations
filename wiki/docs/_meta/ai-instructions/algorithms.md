# AI Instructions — Algorithms & Concepts Pages

> **Read `_base.md` first.** This file contains only the type-specific rules for algorithm and concept articles.

---

## TOPIC

[INSERT TOPIC, e.g., "CAP Theorem", "Consistent Hashing", "ACID vs BASE", "Bloom Filter"]

---

## NEVER

In addition to the shared NEVER rules in `_base.md`:

- Include formal notation, ε-δ proofs, or full inductive proofs
- Use standards-body URNs, IANA identifiers, or proprietary strings in examples — use simple readable placeholders instead

---

## GOALS & AUDIENCE

- **Goal:** Interview prep (trade-offs, application to system design, reasoning under constraints) + deep conceptual mastery
- **Persona:** Senior system design educator and technical writer
- **Audience:** Engineers with adjacent knowledge. Self-contained — no external resources required. Prerequisites handle foundational onboarding.
- **Approach:** Intuition-first progressive disclosure — mental model → formal definition → mechanics → variants → real-world application → production trade-offs & interview scenarios.

---

## PHASED EXECUTION PROTOCOL

Standard 2-phase protocol from `_base.md`. No additions.

---

## FILE NAMING CONVENTION

- Lowercase, hyphen-separated, `.md` extension.
- Algorithm/concept pages: `[topic-name].md` (e.g., `cap-theorem.md`, `consistent-hashing.md`, `bloom-filter.md`)
- Sub-pages: `[parent-topic]-[subtopic].md` (e.g., `cap-theorem-interview-scenarios.md`)

---

## PAGE STRUCTURE (FIXED — ALWAYS IN THIS ORDER)

1. **Title** — `# [Concept Name]`
2. **Prerequisites** — bulleted list. Each bullet: tier + one sentence on why it matters for THIS concept specifically.
   - ✅ `**[Consistency Models](./consistency-models.md)** [Must read] — CAP's "C" maps directly to linearizability; without this, the theorem's guarantees will be misread as weaker than they are.`
   - ❌ `**[Consistency Models](./consistency-models.md)** — Knowledge of consistency.`
3. **Table of Contents** — flat linked list of all H2 sections. Always after Prerequisites.
4. **TLDR** — up to 5 sentences (≤50 words), plain prose, no bullet points. What the concept is, the core insight, and the key design trade-off it implies. Self-contained.
   - ✅ "CAP Theorem states that a distributed system can guarantee at most two of: Consistency, Availability, and Partition Tolerance. Since network partitions are unavoidable in practice, the real trade-off is C vs A during a partition. CA systems don't exist at scale — systems choose CP (return error on partition) or AP (return stale data)."
   - ❌ "This page covers CAP Theorem. We will discuss what it means, its implications, and common misconceptions about it."

Then the main content follows.

---

## INDEX FORMAT RULES — Examples

Rules are in `_base.md`. Type-specific examples:

✅ `- Partition tolerance — why it's non-negotiable`
✅ ` - PACELC — latency/consistency trade-off beyond CAP`
❌ `- Overview of the three CAP properties and what they mean`
❌ ` - Discussion of extensions to CAP and their practical implications`

---

## HEADING STYLE RULES — Examples

Rules are in `_base.md`. Type-specific examples:

- ✅ `### PACELC Model` with `#### Latency vs Consistency` below
- ❌ `### PACELC Model — Latency and Consistency Beyond CAP`
- ✅ `### Split-Brain — Quorum Fencing`
- ✅ `### Why CA Systems Don't Exist at Scale`
- ❌ `### CA Systems Do Not Exist at Scale Because Partitions Are Inevitable`

---

## CONTENT GENERATION SPECIFICATIONS

Section structure, callouts, definitions, tables, vendor examples are in `_base.md`.

### Proof Sketches

Include a proof sketch **only when the argument itself is the insight** — when knowing _why_ the theorem holds changes how you design systems.

- **Include when:** the result is non-obvious and the argument reveals an architectural constraint (e.g., CAP — network partition forces a C/A choice; FLP — single crash can stall consensus)
- **Skip when:** the mechanism is more important than the proof, or the intuition is sufficient

Rules when included:

- Intuitive argument only — no formal notation, no induction
- One paragraph max
- Frame as "why this must be true" not "here is the proof"

### Analogy

For abstract theorems and formal concepts, lead with one concrete real-world analogy before the mental model. The analogy must map directly to the key trade-off — not just the name.

✅ "CAP = a bank branch during a network outage: stop serving customers (CP) or serve with possibly stale balances (AP)."
❌ "CAP is like choosing between different priorities in a system."

### Formal Definition

State the formal definition in plain English. If the concept has a canonical statement, quote it then immediately restate in plain English. 1 sentence preferred, 1–3 max (≤30 words). No notation.

### Variants & Extensions

When a concept has meaningful variants (e.g., CAP → PACELC; consistency models → strong/eventual/causal):

- Compare variants using a table when 3+ dimensions exist
- Order: common case first, then extensions and edge cases
- Avoid listing every variant — only those with distinct design implications

### Often Confused With

When a concept is commonly conflated with another (e.g., CAP vs PACELC, ACID vs BASE, linearizability vs serializability), include direct disambiguation before variants, after core mechanics. Use a table if 3+ dimensions differ. Frame as "X focuses on **_, Y focuses on _**" — not as corrections.

### Complexity & Formal Properties

For algorithms with meaningful complexity characteristics (time, space, error bounds, false positive rates):

- State bounds plainly in prose or a small inline table
- No derivations — just the result and what it means for system design
- Always connect to the practical implication: "O(1) lookup means this scales to billions of keys without latency growth"

### Diagrams

Plain ASCII or mermaid code blocks. Mandatory when spatial relationships or state transitions are core to understanding (e.g., consistent hashing ring, CAP triangle, Bloom filter bit array). Minimal and interview-whiteboard-friendly.

### Code & Config

Only where directly relevant — pseudocode when the algorithm logic sticks faster than prose (e.g., Bloom filter insert/lookup). Always brief. Never include production boilerplate.

### Inline Links — Path Conventions

From an algorithms/concepts page:

- Same directory: `./file.md`
- Components: `../components/file.md`
- Other algorithms: `../algorithms/file.md`
- HLD pages: `../hld/file.md`

---

## STRUCTURE GUIDELINES

- DO NOT prescribe a fixed section order. Concept's nature drives the flow.
- Depth reflects conceptual complexity — the more layered and nuanced a concept, the deeper it nests.
- Prerequisites, Table of Contents, TLDR are mandatory upfront (that order — non-negotiable).
- End with Appendices.
- Unbalanced tree by design: depth = complexity, not symmetry.

**Failure modes follow a two-level pattern:**

- **Inline H3s:** each failure mode or misapplication is an H3 within its relevant parent H2
- **Dedicated summary H2** (e.g., `## Common Misapplications & Gotchas`): consolidates all failure modes and misconceptions. Always present. Primary interview revision target.

**When This Applies** (when to apply / when not to / how to choose) — place after Core Mechanics, not before.

**Assumptions & Preconditions** — for theorems and formal concepts, include a named subsection covering: what must be true for this concept to hold, and what breaks when those assumptions are violated. This is distinct from failure modes — it's the boundary conditions of the concept itself.

✅ CAP assumes asynchronous network. Under synchronous networks, CA is theoretically achievable.
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
- Performance & Complexity (bounds, scaling behaviour, resource implications)
- Common Misapplications & Gotchas
- Appendices
- Interview Scenario Bank

---

## SELF-CHECK

### Phase 1 — Before outputting the index, verify:

- [ ] Tree is unbalanced — depth reflects conceptual complexity, not symmetry?
- [ ] All index bullets are crisp phrases — no sentences, no definitions?
- [ ] Concepts with own pages annotated with `(→ filename.md)` in index?
- [ ] Inapplicable sections omitted — no empty placeholders?
- [ ] Index builds progressive complexity: intuition → formal definition → mechanics → variants → real-world application → interview defense?

If all true → output index → STOP. Wait for user confirmation.

### Phase 2 — Additional checks beyond `_base.md`:

- **Proof sketch test:** Does the proof sketch illuminate a design insight, or is it just formalism? If the latter — cut it.
