import { ComparisonExpression, HyphenatedExpressionArgs, TernaryExpression } from './interfaces.js';

export function ternary(
    condition: ComparisonExpression,
    whenTrue: string | HyphenatedExpressionArgs | TernaryExpression,
    whenFalse: string | HyphenatedExpressionArgs | TernaryExpression,
): TernaryExpression {
    const conditionalOutput = condition.output;

    let whenTrueOutput: string;

    if (typeof whenTrue === 'string') {
        whenTrueOutput = `'${whenTrue}'`;
    } else if ((whenTrue as TernaryExpression)?.output != null) {
        whenTrueOutput = (whenTrue as TernaryExpression).output;
    } else if ((whenTrue as HyphenatedExpressionArgs)?.isHyphenatedExpressionArgs) {
        whenTrueOutput = (whenTrue as HyphenatedExpressionArgs).output;
    } else {
        throw new Error(`Invalid type for whenTrue parameter ${whenTrue} in ternary expression`);
    }

    let whenFalseOutput: string;

    if (typeof whenFalse === 'string') {
        whenFalseOutput = `'${whenFalse}'`;
    } else if ((whenFalse as TernaryExpression)?.output != null) {
        whenFalseOutput = (whenFalse as TernaryExpression).output;
    } else if ((whenFalse as HyphenatedExpressionArgs)?.isHyphenatedExpressionArgs) {
        whenFalseOutput = (whenFalse as HyphenatedExpressionArgs).output;
    } else {
        throw new Error(`Invalid type for whenFalse parameter ${whenFalse} in ternary expression`);
    }

    return {
        output: `${conditionalOutput} ? ${whenTrueOutput} : ${whenFalseOutput}`,
        isTernaryExpression: true,
    };
}
