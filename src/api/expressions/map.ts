import { FromJsonCastExpression, HyphenatedExpressionArgs, KeysExpression, ValuesExpression } from './classes.js';
import { UndefinedExpressionArg } from './tag.js';

export function keys(
    input: HyphenatedExpressionArgs | UndefinedExpressionArg | FromJsonCastExpression,
): KeysExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new KeysExpression(`keys(${(input as UndefinedExpressionArg).string})`);
    }

    return new KeysExpression(`keys(${input})`);
}

export function values(
    input: HyphenatedExpressionArgs | UndefinedExpressionArg | FromJsonCastExpression,
): ValuesExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new ValuesExpression(`values(${(input as UndefinedExpressionArg).string})`);
    }

    return new ValuesExpression(`values(${input})`);
}
