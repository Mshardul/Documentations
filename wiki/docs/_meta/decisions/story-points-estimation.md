# Story Points Estimation

## Scale

Fibonacci sequence. Cap at 13 (rare).

| Points | Signal                                                           |
| ------ | ---------------------------------------------------------------- |
| 1      | Single-site change, no new test needed                           |
| 2      | 1–2 files, clear spec, 1–2 tests                                 |
| 3      | 2–3 files, some wiring, small test surface                       |
| 5      | Multi-file, moderate complexity, non-trivial tests               |
| 8      | Significant new subsystem or broad refactor, meaningful unknowns |
| 13     | Only if task cannot be split further - rare                      |

**Default ceiling: 8.** If you reach for 13, try to split first.

## What "effort" includes

- Implementation
- Writing / updating / removing tests
- Docs/backlog updates

## What does NOT get estimated

- Content-only tasks (article writing, copy changes) - out of scope

## Estimation dimensions

- **Code complexity** - algorithmic logic vs. wiring vs. markup
- **Files touched** - isolated vs. cross-module
- **Unknowns** - clear spec vs. requires exploration
- **Test effort** - new test file vs. one assertion

## Calibration anchor

WIKI-079 + WIKI-082 (combined) = **2 points**

- ~1.25–1.5 pts development (3 files, clear spec, delegated listener + aria attrs)
- ~0.5–0.75 pts tests (3 new tests across existing files)
