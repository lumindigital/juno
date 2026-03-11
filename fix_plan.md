# Fix Plan

## Completed

- [x] Add remaining cast functions (`asInt`, `asFloat`, `asString`, `toJson`, `fromJson`, `asType`, `toBase64`, `fromBase64`, `toPairs`) — committed
- [x] Add misc expression functions (`len`, `get`) with unit tests, example, and YAML — committed
- [x] Update CLAUDE.md with expression class docs, testing docs, and examples section — committed

## Current State

Branch `add_remaining-missing_functions` is ahead of `main` with 3 commits:
1. `feat: added remaining cast functions` (cast expressions)
2. `feat: added remaining cast functions` (duplicate message, also cast-related)
3. `feat: add len and get misc expression functions` (misc expressions)

All pre-commit hooks pass. Build succeeds. All 481 tests pass (verified 2026-03-11).
Unit tests and example YAML exist for all new functions.

mise.toml added to ensure Node.js v25.8.0 is active.

## Remaining Work

### Priority 1: Environment Fix — DONE
- [x] Fix Node.js version — mise.toml added, v25.8.0 active
- [x] Run full test suite (`npm run test`) — all 481 tests passing

### Priority 2: Cleanup
- [ ] Remove `scripts/gen-misc-yaml.ts` (temporary helper, not needed) — blocked by sandbox, needs manual deletion
- [ ] Consider squashing the two duplicate "feat: added remaining cast functions" commits before merging

### Priority 3: Potential Future Expression Functions
These expr-lang built-in functions are not yet implemented (may or may not be needed for Argo Workflows):
#### Array Functions
- all(array, predicate)
- any(array, predicate)
- one(array, predicate)
- none(array, predicate)
- map(array, predicate)
- filter(array, predicate)
- find(array, predicate)
- findIndex(array, predicate)
- findLast(array, predicate)
- findLastIndex(array, predicate)
- groupBy(array, predicate)
- count(array[, predicate])
- concat(array1, array2[, ...])
- flatten(array)
- uniq(array)
- join(array[, delimiter])
- reduce(array, predicate[, initialValue])
- sum(array[, predicate])
- mean(array)
- median(array)
- first(array)
- last(array)
- take(array, n)
- reverse(array)
- sort(array[, order])
- sortBy(array[, predicate, order])

#### Map Functions
- keys(map)
- values(map)

#### Date Functions
- now()
- duration(str)
- date(str[, format[, timezone]])
- timezone(str)

#### Number Functions
- max(n1, n2)
- min(n1, n2)
- abs(n)
- ceil(n)
- floor(n)
- round(n)

#### Bitwise Functions
All bitwise functions can be ignored

### Priority 4: PR
- [x] Create PR from `add_remaining-missing_functions` → `main`
