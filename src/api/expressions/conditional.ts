import {
    ComparisonExpression,
    HyphenatedExpressionArgs,
    NilCoalescingExpression,
    TernaryExpression,
} from './classes.js';
import { wrapStringInQuotes } from './util.js';

export function ternary(
    condition: ComparisonExpression,
    whenTrue: string | HyphenatedExpressionArgs | TernaryExpression,
    whenFalse: string | HyphenatedExpressionArgs | TernaryExpression,
): TernaryExpression {
    const conditionalOutput = condition.toString();

    let whenTrueOutput: string;

    if (typeof whenTrue === 'string') {
        whenTrueOutput = wrapStringInQuotes(whenTrue.toString());
    } else if ((whenTrue as TernaryExpression).isTernaryExpression) {
        whenTrueOutput = (whenTrue as TernaryExpression).toString();
    } else if ((whenTrue as HyphenatedExpressionArgs)?.isHyphenatedExpressionArgs) {
        whenTrueOutput = (whenTrue as HyphenatedExpressionArgs).toString();
    } else {
        throw new Error(`Invalid type for whenTrue parameter ${whenTrue} in ternary expression`);
    }

    let whenFalseOutput: string;

    if (typeof whenFalse === 'string') {
        whenFalseOutput = wrapStringInQuotes(whenFalse.toString());
    } else if ((whenFalse as TernaryExpression)?.isTernaryExpression) {
        whenFalseOutput = (whenFalse as TernaryExpression).toString();
    } else if ((whenFalse as HyphenatedExpressionArgs)?.isHyphenatedExpressionArgs) {
        whenFalseOutput = (whenFalse as HyphenatedExpressionArgs).toString();
    } else {
        throw new Error(`Invalid type for whenFalse parameter ${whenFalse} in ternary expression`);
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
