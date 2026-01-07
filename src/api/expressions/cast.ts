import {
    FloatCastExpression,
    HyphenatedExpressionArgs,
    IntCastExpression,
    JsonCastExpression,
    StringCastExpression,
} from './classes.js';
import { UndefinedExpressionArg } from './tag.js';

export function asInt(input: HyphenatedExpressionArgs | UndefinedExpressionArg): IntCastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new IntCastExpression(`asInt(${(input as UndefinedExpressionArg).string})`);
    }

    return new IntCastExpression(`asInt(${input})`);
}

export function asFloat(input: HyphenatedExpressionArgs | UndefinedExpressionArg): FloatCastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new FloatCastExpression(`asFloat(${(input as UndefinedExpressionArg).string})`);
    }

    return new FloatCastExpression(`asFloat(${input})`);
}

export function asString(input: HyphenatedExpressionArgs | UndefinedExpressionArg): StringCastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new StringCastExpression(`asString(${(input as UndefinedExpressionArg).string})`);
    }

    return new StringCastExpression(`asString(${input})`);
}

export function toJson(input: HyphenatedExpressionArgs | UndefinedExpressionArg): JsonCastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new JsonCastExpression(`asString(${(input as UndefinedExpressionArg).string})`);
    }

    return new JsonCastExpression(`toJson(${input})`);
}
