import { FromJsonCastExpression, GetExpression, HyphenatedExpressionArgs, LenExpression } from './classes.js';
import { UndefinedExpressionArg } from './tag.js';

export function len(input: HyphenatedExpressionArgs | UndefinedExpressionArg | FromJsonCastExpression): LenExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new LenExpression(`len(${(input as UndefinedExpressionArg).string})`);
    }

    return new LenExpression(`len(${input})`);
}

export function get(
    input: HyphenatedExpressionArgs | UndefinedExpressionArg | FromJsonCastExpression,
    index: number | string,
): GetExpression {
    const indexOutput = typeof index === 'string' ? `'${index}'` : index;

    if ((input as UndefinedExpressionArg)?.string) {
        return new GetExpression(`get(${(input as UndefinedExpressionArg).string}, ${indexOutput})`);
    }

    return new GetExpression(`get(${input}, ${indexOutput})`);
}
