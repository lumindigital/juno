import { ExpressionArgs, getVariableReference } from '../expression.js';
import { JsonPathExpression } from './interfaces.js';

export function jsonPath(input: ExpressionArgs, value: string): JsonPathExpression {
    return {
        output: `jsonpath(${getVariableReference(input)}, '${value}')`,
        isJsonPathExpression: true,
    };
}
