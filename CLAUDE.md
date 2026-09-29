# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Juno is an unofficial TypeScript CLI tool that simplifies the construction of [Argo Workflows](https://github.com/argoproj/argo-workflows). It reduces magic strings and provides strong type safety and validation for complex workflow definitions.

- **Package**: @lumindigital/juno
- **Node.js**: >=24.0.0
- **CLI Framework**: oclif v4

## Build & Development Commands

```bash
npm run build      # Compile TypeScript (runs lint+pretty first)
npm run test       # Full test suite with coverage (c8 + mocha)
npm run lint       # ESLint with auto-fix + prettier
npm run pretty     # Format code with Prettier

# CLI usage
./bin/dev.js generate -i <input_dir> -o <output_dir>  # Development mode
./bin/run.js generate -i <input_dir> -o <output_dir>  # Production mode

# Run specific example tests
TEST_NAME=hello-world npm run testExample
```

## Architecture

### Core API (`src/api/`)

Key classes for building Argo Workflows:
- **Workflow**: Top-level container
- **WorkflowSpec**: Configuration and entrypoint - auto-discovers template dependencies
- **Template**: Container/DAG/Script templates
- **DagTemplate** / **DagTask**: DAG-based workflow definitions
- **Parameter** / **Artifact**: Input/output handling

### Expression System (`src/api/expressions/`)

Type-safe references to workflow variables:
- `arithmetic.ts`: `+`, `-`, `*`, `/`, `%`, `**`
- `comparison.ts`: `==`, `!=`, `<`, `>`, `<=`, `>=`
- `logical.ts`: `&&`, `||`, `!`
- `conditional.ts`: Ternary operator
- `membership.ts`: `in` keyword
- `cast.ts`: Type conversion functions based on [expr-lang](https://expr-lang.org/docs/language-definition#type-conversion-functions) (`asInt`, `asFloat`, `asString`, `toJson`, `fromJson`, `asType`, `toBase64`, `fromBase64`, `toPairs`)
- `util.ts`: Expression builders (~700 LOC)

#### Expression Classes (`classes.ts`)

Each expression type has a dedicated class (e.g., `IntCastExpression`, `JsonCastExpression`). New expression types require:
1. A class in `classes.ts` with a `toString()` method
2. Adding the class to the appropriate union type (e.g., `CastExpressions`)
3. A function in the relevant module (e.g., `cast.ts`) that accepts `HyphenatedExpressionArgs | UndefinedExpressionArg`
4. The `UndefinedExpressionArg` branch checks `input.string` for raw string inputs

#### Cast Function Naming Convention

Cast function names in TypeScript may differ from the expr-lang output string (e.g., `toJson()` produces `toJSON()`, `asType()` produces `type()`). The output string must match the expr-lang function name exactly. Expressions can be composed by passing one expression as input to another (e.g., `toPairs(fromJson(arg))`).

### Workflow Generation Pattern

```typescript
// 1. Define templates
const template = new Template('name', { container: ... })
const workflow = new Workflow({ metadata: {...}, spec: new WorkflowSpec({...}) })

// 2. Export generateTemplate() function - CLI discovers this
export async function generateTemplate() { return workflow.toWorkflow() }

// 3. CLI converts to YAML output
```

### Auto-generated Interfaces

`src/workflow-interfaces/data-contracts.ts` - Generated from Argo OpenAPI spec via swagger-typescript-api. Regenerate with `npm run interfaces`.

## Testing

- **Framework**: Mocha + Chai + c8 for coverage
- **Config**: `.mocharc.json` (60s timeout, ts-node ESM loader)
- **Unit tests**: `test/api/` — mirror the `src/api/` structure
- **Integration tests**: `test/examples/test-harness.test.ts` — imports each example's `generateTemplate()`, compares the result against the corresponding `.yaml` file (templates are sorted by name before comparison)
- **Example tests**: Each example in `examples/` has a `.ts` and `.yaml` file. The `.yaml` is the expected output. When adding/modifying expressions, both files must stay in sync. Run a single example with `TEST_NAME=<name> npm run testExample`. It is extremely important that the `.yaml` files are not changed to make the tests pass. The only changes allowed to `.yaml` files are minor formatting changes
- **Running Tests**: `npm run test` runs all of the tests. `TEST_NAME=NAME_OF_TEST npm run testExample` to run a single example. NAME_OF_TEST is the filename without the extension.


## Code Quality

Pre-commit hooks enforce:
- ESLint + Prettier formatting
- Conventional commits (commitlint)
- File checks (trailing whitespace, YAML, JSON validation)

Run manually: `pre-commit run --all-files`

## Key Patterns

1. **Self-Contained Workflows**: Avoid template references for better versioning
2. **Objects Over Strings**: Use typed classes instead of magic strings
3. **Template Auto-Discovery**: WorkflowSpec walks dependencies, no manual template arrays needed
4. **DAG Entrypoint Pattern**: Single-task DAG entry with global variable references

## Examples

`examples/argo` contains 20+ working examples demonstrating various patterns. These examples come from the argo workflows project directly.
`examples/juno/expressions` contains examples written specifically for testing the implementation of the [expr library](https://expr-lang.org/docs/language-definition)
Reference these for implementation guidance.

### Adding a New Expression Function

1. Add the expression class to `src/api/expressions/classes.ts` and include it in the relevant union type
2. Add the function to the appropriate module in `src/api/expressions/` (follow the `UndefinedExpressionArg` check pattern)
3. Add unit tests in `test/api/expressions/` covering both `HyphenatedExpressionArgs` and `UndefinedExpressionArg` inputs
4. Update the relevant example in `examples/` (both `.ts` and `.yaml`) to exercise the new function
5. The example `.yaml` must exactly match the output of `generateTemplate()` — use `TEST_NAME=<name> npm run testExample` to verify
6. Be mindful of string escaping in script sources: JS template literals need `\\"` to produce a literal `\"` in the output
