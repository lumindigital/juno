# Fix Plan

## Completed

- [x] Add remaining cast functions (`asInt`, `asFloat`, `asString`, `toJson`, `fromJson`, `asType`, `toBase64`, `fromBase64`, `toPairs`) — committed
- [x] Add misc expression functions (`len`, `get`) with unit tests, example, and YAML — committed
- [x] Update CLAUDE.md with expression class docs, testing docs, and examples section — committed
- [x] Add number expression functions (`max`, `min`, `abs`, `ceil`, `floor`, `round`) with unit tests, example, and YAML — committed
- [x] Add map expression functions (`keys`, `values`) with unit tests, example, and YAML — committed
- [x] Add array expression functions (`first`, `last`, `flatten`, `reverse`, `sort`, `uniq`, `join`, `concat`) with unit tests, example, and YAML — committed
- [x] Add array expression functions (`mean`, `median`, `take`) with unit tests, example, and YAML — committed
- [x] Add date expression functions (`now`, `duration`, `date`, `timezone`) with unit tests, example, and YAML — committed
- [x] Add predicate-based array expression functions (`all`, `any`, `one`, `none`, `map`, `filter`, `find`, `findIndex`, `findLast`, `findLastIndex`, `groupBy`, `count`, `reduce`, `sum`, `sortBy`) with unit tests, example, and YAML — committed

## Current State

Branch `add_remaining-missing_functions` is ahead of `main` with 8 commits.
All pre-commit hooks pass. Build succeeds. All 606 tests pass (verified 2026-03-11).

## Remaining Work

### Cleanup
- [ ] Remove `scripts/gen-number-yaml.ts` (temporary helper, not needed) — blocked by sandbox, needs manual deletion
- [ ] Remove `scripts/gen-array-yaml.ts` (temporary helper, not needed) — blocked by sandbox, needs manual deletion
- [ ] Consider squashing the two duplicate "feat: added remaining cast functions" commits before merging

### Potential Future Expression Functions
These expr-lang built-in functions are not yet implemented (may or may not be needed for Argo Workflows):

#### Array Functions (simple) — DONE
- ~~first(array)~~
- ~~last(array)~~
- ~~flatten(array)~~
- ~~reverse(array)~~
- ~~sort(array)~~
- ~~uniq(array)~~
- ~~join(array[, delimiter])~~
- ~~concat(array1, array2[, ...])~~

#### Array Functions (predicate-based) — DONE
- ~~all(array, predicate)~~
- ~~any(array, predicate)~~
- ~~one(array, predicate)~~
- ~~none(array, predicate)~~
- ~~map(array, predicate)~~
- ~~filter(array, predicate)~~
- ~~find(array, predicate)~~
- ~~findIndex(array, predicate)~~
- ~~findLast(array, predicate)~~
- ~~findLastIndex(array, predicate)~~
- ~~groupBy(array, predicate)~~
- ~~count(array[, predicate])~~
- ~~reduce(array, predicate[, initialValue])~~
- ~~sum(array[, predicate])~~
- ~~sortBy(array[, predicate, order])~~

#### Array Functions (other) — DONE
- ~~mean(array)~~
- ~~median(array)~~
- ~~take(array, n)~~

#### Map Functions — DONE
- ~~keys(map)~~
- ~~values(map)~~

#### Date Functions — DONE
- ~~now()~~
- ~~duration(str)~~
- ~~date(str[, format[, timezone]])~~
- ~~timezone(str)~~

#### Number Functions — DONE
- ~~max(n1, n2)~~
- ~~min(n1, n2)~~
- ~~abs(n)~~
- ~~ceil(n)~~
- ~~floor(n)~~
- ~~round(n)~~

#### Bitwise Functions
All bitwise functions can be ignored
