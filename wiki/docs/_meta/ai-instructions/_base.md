# AI Instructions — Base Rules

> This file contains rules shared across all content types: components, algorithms, HLD, devops-tools.
> **Always read this file first**, then read the type-specific file.
> Cheatsheet pages (`devops-cheatsheets.md`) are self-contained — do not read this file for those.

---

## NEVER

Shared across all article types. Type-specific files may add further constraints.

- Start a section with "In this section, we will…" or "This page covers…"
- Define a term inline if it has its own linked page — link it instead
- Generate symmetric section depth — depth must reflect complexity, not balance
- Use "important", "note that", or "it is worth mentioning" as padding
- Repeat the Interviewer TL;DR verbatim in the Key Takeaway
- Open with history or evolution of the topic
- State unverified facts, statistics, or attributions — when uncertain, qualify with "typically" or "commonly" rather than asserting as fact
- Include full function or class implementations in code blocks — pseudocode or prose only; full implementations belong in dedicated pages

---

## PHASED EXECUTION PROTOCOL

Standard for all article types. HLD adds a PHASE 0 before Phase 1 — see `hld.md`.

- **PHASE 1:** Generate ONLY the index. Stop. Wait for user confirmation before generating any content.
- **PHASE 2:** Upon "Proceed", generate content one H2 section at a time. Output one section, stop, wait for "Continue" before the next. Resolve all `(→ filename.md)` markers into actual inline markdown links when the concept first appears.
- Never skip phases. Never merge index and content in the same response.

---

## INDEX FORMAT RULES

- Plain text only. NO markdown code blocks, NO fenced sections.
- Hierarchical dashes: each depth level indented 4 spaces, no numbers, no fixed depth limit.
- Short, crisp phrases only — no sentences, no explanations.
- Index is high signal-to-noise only. Zero fluff, zero basic definitions. Content follows progressive disclosure.
- No cross-references like "see the section above" in the index.
- Acronyms free in index. Full definitions in APPENDICES > Acronyms only.
- Vendor-specific implementations: keep bullet generic. Examples belong in content only.
- When a concept has its own page, append `(→ filename.md)` to the bullet as a reminder to inline-link during content generation.

Type-specific ✅/❌ examples are in the respective type file.

---

## HEADING STYLE RULES

- **Concept H3s:** Clean name only — no trailing description. H4 for sub-concepts.
- **Failure mode H3s:** Dash acceptable when mitigation is integral to naming the pattern.
- **No heading-as-sentence.** Headings must be crisp noun phrases.

Type-specific examples are in the respective type file.

---

## CONTENT GENERATION SPECIFICATIONS

### Section Structure & Progressive Disclosure

Each H2 section follows this fixed envelope, in this order:

1. **Interviewer TL;DR** — 1–2 sentences. The single most important thing to say in an interview. Optimised for quick revision.
2. **Mental model** — One sentence. An intuitive anchor before any mechanics or formalism.
3. **Body** — Core mechanics → alternatives considered and rejected → trade-offs, edge cases, failure modes. Depth follows importance.
4. **Callouts** — Interview Lens and Decision Framework where applicable (see Callouts below).
5. **Key Takeaway** — 1–2 sentences. The most important decision or trade-off from this section.

For important H3 subsections, add a one-line italic insight immediately after the heading:

> _One sentence capturing the core insight before diving in._

---

### Callouts

| Emoji | Name                   | When to use                                                                   | Frequency                                                    |
| ----- | ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 🧠    | **Thought Process**    | Show how a senior engineer reasons from requirements to a design decision     | Where section involves non-obvious reasoning — not mandatory |
| ⚖️    | **Decision Framework** | X vs Y constraints, trade-off justification, "when would you NOT use this?"   | ≥1 per section comparing ≥2 design options                   |
| ⚠️    | **Warning / Gotcha**   | Pitfalls, non-obvious failure modes, assumptions that silently break at scale | 1–3 per page max — genuinely non-obvious gotchas only        |

**Interview Lens** — include once per complex H2 section, using this exact format:

```
> 🎯 **Interview Lens**
> **Q:** [Expected interview question]
> **Ideal answer:** [What a strong candidate says - not just correct, but framed well]
> **Common trap:** [The most frequent wrong answer or wrong framing]
> **Next question:** [The follow-up the interviewer asks if the candidate answers well]
```

---

### Definitions

No dictionary-style definitions. Define through purpose and first principle. For unfamiliar terms, add one intuitive one-liner before the deep dive.

### Tables

Use markdown tables for X vs Y trade-off comparisons, feature/property matrices, and decision criteria grids. Keep tables ≤4 columns. Prefer tables over prose for any comparison with 3+ dimensions.

### Vendor Examples

Core explanation generic. Mention 1–2 well-known implementations as examples without deep comparison. No proprietary details.

### Inline Links

Whenever a concept, component, or algorithm with its own wiki page is referenced:

- In prerequisites: `**[Name](relative-link)** - one sentence on why it matters here`
- First appearance in each section body: wrap in link
- File doesn't exist yet: add `<!-- link: file.md -->` immediately after the reference

Path conventions vary by article type — see the type-specific file.

---

## APPENDICES FORMAT

Include only relevant sub-sections. Always placed at the end. Type-specific files may add additional appendix sections.

**Acronyms & Abbreviations**
Table format: `Acronym | Full Form | One-line meaning`
Scope: only acronyms for concepts directly and substantially covered in this article. If a concept has its own page, its internal acronyms belong there.

**Anti-patterns**
Bulleted list. Each entry: `pattern name — why it fails — what to do instead.`

**Selection Matrix** _(include only if topic has multiple meaningful variants worth comparing)_
Table comparing variants across key decision dimensions (columns = variants, rows = criteria).

---

## CONSTRAINTS

- Every major decision needs: what alternatives were considered and why rejected.
- NO meta-commentary in index bullets — state concepts only.
- NO redundant nesting: if depth-3 suffices, skip depth-4.
- Within a level, order bullets by logical flow: prerequisites before advanced, common before edge cases, cause before effect.
- One topic per leaf: don't group unrelated concepts under one bullet.

Type-specific files may add further constraints.

---

## SELF-CHECK — Phase 2

**Before outputting each Phase 2 section, run:**

- **TLDR flashcard test:** Can someone use this TLDR standalone as an interview flashcard? If it says "In this article…", "We will cover…", or references other sections — rewrite.
- **Key Takeaway sticky-note test:** Would a candidate write this on a post-it? If longer than 2 sentences or repeats the Interviewer TL;DR — compress it.
- **Code block whiteboard test:** Would you write this on a whiteboard in an interview? If not — cut it.

Type-specific files add further Phase 2 checks. Phase 1 self-check is in the type-specific file.
