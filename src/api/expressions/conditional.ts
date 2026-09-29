import {
    ComparisonExpression,
    ConcatExpression,
    HyphenatedExpressionArgs,
    LogicalExpression,
    NilCoalescingExpression,
    StringFunctionExpressions,
    StringOperatorExpressions,
    TernaryExpression,
} from './classes.js';
import { wrapStringInQuotes } from './util.js';

export function ternary(
    condition: ComparisonExpression | LogicalExpression | StringOperatorExpressions,
    whenTrue: string | HyphenatedExpressionArgs | TernaryExpression | StringFunctionExpressions | ConcatExpression,
    whenFalse: string | HyphenatedExpressionArgs | TernaryExpression | StringFunctionExpressions | ConcatExpression,
): TernaryExpression {
    const conditionalOutput = condition.toString();

    let whenTrueOutput: string;

    if (typeof whenTrue === 'string') {
        whenTrueOutput = wrapStringInQuotes(whenTrue.toString());
    } else {
        whenTrueOutput = whenTrue.toString();
    }

    let whenFalseOutput: string;

    if (typeof whenFalse === 'string') {
        whenFalseOutput = wrapStringInQuotes(whenFalse.toString());
    } else {
        whenFalseOutput = whenFalse.toString();
    }

    return new TernaryExpression(`${conditionalOutput} ? ${whenTrueOutput} : ${whenFalseOutput}`);
}

export function nilCoalescing(
    condition: HyphenatedExpressionArgs,
    whenNil: string | HyphenatedExpressionArgs,
): NilCoalescingExpression {
    let nilResult: string;

    if (typeof whenNil === 'string') {
        nilResult = wrapStringInQuotes(whenNil.toString());
    } else {
        nilResult = whenNil.toString();
    }

    return new NilCoalescingExpression(`${condition.toString()} ?? ${nilResult}`);
}
