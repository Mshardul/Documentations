<!--
  Algorithms skeleton. Copy to content/dsa/algorithms/<slug>.md and fill.
  Rules: docs/_meta/ai-instructions/dsa-writer.md  (param IDs in the comments below).
  Delete every HTML comment before publishing. The app never indexes _templates.
  Replace the family heading with the ONE matching your family (see writer › Family blocks).
-->

# Quickselect

## Prerequisites

<!-- U9: [Title](./path.md) [Must read] - reason. HTML-comment link for unwritten targets. -->

## Table of Contents

<!-- U10. -->

## What it is

<!-- U1: definition + mental model. U13: spoken soundbite, marked as the takeaway. U2: state time + space O() here or in the derivation. -->

## Intuition

<!-- AL1: plain-language WHY it works, separate from the walkthrough. Analogy welcome. -->

## How it works

<!-- AL2: step-by-step trace on a concrete input + a REAL diagram. Point back to the invariant per step if possible. -->

## Correctness / invariant

<!-- AL3: state the loop/recurrence invariant or correctness argument explicitly. -->

## Complexity derivation

<!-- AL4: WHY the O — solve the recurrence or count steps/space. Not "it's O(n)". -->

## Constraints & approach

<!-- AL10 (gated): a TABLE mapping input size → expected complexity → which approach (n ≤ 20 → O(2ⁿ)/bitmask; n ≤ 500 → O(n³); n ≤ 1e5 → O(n log n); n ≤ 1e9 → O(log n)/O(1)). State what each constraint rules OUT and invites. Generic "consider constraints" with no size→approach mapping caps at 5. -->

## When to use / when not

<!-- AL5 + U3: decision cues vs ≥1 competing algorithm — PROSE. Scannable table is AL9 below.
     U17 (advisory): fold in ONE sentence naming a real system where this algorithm is a workhorse. -->

## Comparison

<!-- AL9 (gated): a TABLE — rows = this algorithm + competing algorithms, columns = time/space + the key constraint each assumes (sorted input? non-negative weights?). Must add what AL5 prose doesn't; prose-only or single-row caps at 5. -->

## <Family heading>

<!-- FB: ONE of — Loop/recurrence invariant / Graph-tree assumptions / State & recurrence / Greedy-choice proof or Bit-tricks table. -->

## Edge cases

<!-- AL6: ≥3 of empty / single / duplicates / overflow / cycles. Handle each in the Python where natural. Include ≥1 CP-flavored trap where relevant: int/long overflow, binary-search bound off-by-one, modular arithmetic (% 1e9+7), 1-vs-0 indexing, fast I/O. -->

## Implementation

<!-- AL7: U5 pseudocode (CLRS) + U4 Python (idiomatic). Pseudocode must NOT be pasteable as Python.
     U4 contest velocity: where a stdlib one-liner (bisect / Counter / heapq / accumulate) replaces hand-rolled logic, show it. -->

## What the interviewer probes for

<!-- AL8 (advisory): typical follow-ups, each = question + 2–3 sentence answer sketch. Cover the probe on every choice you recommend. -->

## Practice problems

<!-- U6: ≥3 problems, each a WORKED entry (### subheading per problem): (1) full problem statement in 2–3 sentences + constraints where they matter; (2) approach/insight in prose; (3) short runnable Python solution; (4) time/space complexity. Tag the pattern + relative .md cross-link where a target exists. Favor canonical staples. EVERY PROBLEM MUST EXERCISE A DISTINCT TECHNIQUE — no duplicates padding the count. -->
