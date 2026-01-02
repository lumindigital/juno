import {
    ComparisonExpression,
    HyphenatedExpressionArgs,
    LogicalExpression,
    ParenExpression,
    SimpleTemplateTag,
} from './interfaces.js';

export type LogicalExpressionInputs =
    | SimpleTemplateTag
    | HyphenatedExpressionArgs
    | ComparisonExpression
    | LogicalExpression
    | ParenExpression;

export function and(inputs: LogicalExpressionInputs[]): LogicalExpression {
    const result = inputs.map((x) => x.output).join(' && ');
    return { output: result, isLogicalExpression: true };
}

export function or(inputs: LogicalExpressionInputs[]): LogicalExpression {
    const result = inputs.map((x) => x.output).join(' || ');
    return { output: result, isLogicalExpression: true };
}

export function not(input: LogicalExpressionInputs): LogicalExpression {
    if (input && (input as ParenExpression)?.isParenExpression) {
        return {
            output: `!${(input as ParenExpression).output}`,
            isLogicalExpression: true,
        };
    }

    return {
        output: `!${paren(input as LogicalExpression).output}`,
        isLogicalExpression: true,
    };
}

export function paren(input: LogicalExpression): ParenExpression {
    return {
        output: `( ${input.output} )`,
        isParenExpression: true,
    };
}
