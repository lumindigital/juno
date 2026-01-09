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
- `util.ts`: Expression builders (~700 LOC)

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
- **Unit tests**: `test/api/`
- **Integration tests**: `test/examples/test-harness.test.ts` runs example workflows

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

`examples/` contains 20+ working examples demonstrating various patterns. Reference these for implementation guidance.
