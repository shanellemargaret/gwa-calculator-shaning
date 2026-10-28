---
applyTo: "public/**,tests/**"
---

# Academic Policy & Defensive Programming Constraints

This document encodes the grading rules that `public/gwaCalculator.js` MUST
implement, and the defensive-programming standard that any AI assistant or
contributor must follow when touching this repository.

## 1. Grading Domain Rules

- Numerical grades are only valid on the closed interval **[65, 100]**.
  Any grade outside this range is **not a real academic grade** and must
  be rejected with an explicit, descriptive error — never silently
  clamped, rounded, or ignored.
- Units must be a **positive** number (`units > 0`). A course with zero
  or negative units is a data-entry error, not a valid record.
- **NSTP courses are excluded** from:
  - Dean's Lister computations
  - Latin Honors / Academic Standing computations
  They remain visible in the UI and may still be recorded for
  transcript purposes, but must never contribute weighted grade-points
  to an honors calculation.

## 2. Grade-to-Point Conversion Table

| Numerical Grade | Grade Point |
|---|---|
| 97-100 | 1.00 |
| 94-96 | 1.25 |
| 91-93 | 1.50 |
| 88-90 | 1.75 |
| 85-87 | 2.00 |
| 80-84 | 2.50 |
| 75-79 | 3.00 |
| Below 75 | 5.00 / Failed |

## 3. Latin Honors / Academic Standing Thresholds

Applied to the **overall cumulative GWA on the 0-100 numerical scale**,
computed **after** NSTP exclusion:

- `>= 93` -> Summa Cum Laude Standing
- `>= 91` and `< 93` -> Magna Cum Laude Standing
- `>= 88` and `< 91` -> Cum Laude Standing
- Otherwise -> In Good Standing / Regular

## 4. Defensive Programming Constraints

Any change to the calculation engine (`public/gwaCalculator.js`) must satisfy
all of the following before it can be considered complete:

1. **No unguarded division.** JavaScript does NOT throw on division by
   zero — `x / 0` silently returns `NaN` or `Infinity`. Any average
   computed by dividing a weighted sum by a total-units sum MUST
   explicitly check that the denominator is non-zero and `throw new
   InvalidInputError(...)` if it is. A `NaN` silently reaching the UI
   is considered a defect, not an acceptable failure mode.
2. **No silent range violations.** A grade outside `[65, 100]` or units
   `<= 0` must throw before any arithmetic is attempted on it.
3. **Errors must be explainable.** Error messages must name *which*
   course or field failed validation and *why*, so a student debugging
   the failure understands the actual domain rule being enforced, not
   just that "something went wrong."
4. **Tests before fixes.** `tests/gwaCalculator.test.js` is the source
   of truth for expected behavior. A fix is only correct when the full
   suite (`node --test tests/`) passes, not merely when the
   previously-failing test turns green in isolation.
5. **No framework creep.** `public/` stays plain HTML/CSS/vanilla
   JavaScript with zero npm dependencies. Do not introduce React, Vue,
   jQuery, a bundler, or a build step.
6. **One source of truth.** `public/gwaCalculator.js` is imported
   directly by both `public/app.js` (browser) and
   `tests/gwaCalculator.test.js` (Node). Never duplicate the
   calculation logic anywhere else.

## 5. Why This File Exists

This file is read by repository-level AI agents (see
`.github/agents/code-mentor.md`) before they advise a student. It exists
so that AI assistance in this repository is **grounded in the actual
grading policy**, rather than generic coding advice, and so that every
suggestion an agent makes is traceable back to a written, human-owned
rule rather than an opaque model preference.