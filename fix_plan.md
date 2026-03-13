# Fix Plan

## ~~Priority 1: Refactor Existing Expression Examples~~ ✅ COMPLETE
In the examples/juno/expressions there are a number of examples. Some of these examples have scripts that do something similar to this `if [ "$ADD_EQUALS" != true ]; then exit 12; fi`. Refactor any example that uses this pattern to use this pattern `if [ "${simpleTag(trimParamWhiteSpace)}" != "Hello World" ]; then echo "trim failed: got '${simpleTag(trimParamWhiteSpace)}'"; exit 11; fi` instead. If you cannot determine the output in the if statement leave it empty and I will fix it manually.

### Changes Made
- **arithmetic.ts/yaml**: Removed EnvironmentVariable env vars, switched to simpleTag with expected values ("3", "-1", "1", "4", "0", "8"), added echo diagnostics
- **comparison.ts/yaml**: Added echo diagnostics, quoted expected "true" values
- **logical.ts/yaml**: Added echo diagnostics, quoted expected "true" values
- **conditional.ts/yaml**: Added echo diagnostics, quoted expected "true" values
- **cast.ts/yaml**: Removed CAST_INT_TO_STRING env var, added new `cast-literal-string-param` InputParameter, added echo diagnostics
- **membership.ts/yaml**: Added echo diagnostics, quoted expected values ("false", "true", "one")
- All YAML files switched from `>` (folded) to `|` (literal) block scalar format
