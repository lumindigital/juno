import { ExpressionArgs, getVariableReference } from '../expression.js';
import { JsonPathExpression } from './classes.js';

export function jsonPath(input: ExpressionArgs, value: string): JsonPathExpression {
    return new JsonPathExpression(`jsonpath(${getVariableReference(input)}, '${value}')`);
}
