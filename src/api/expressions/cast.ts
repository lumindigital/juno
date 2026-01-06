import {
    FloatCastExpression,
    HyphenatedExpressionArgs,
    IntCastExpression,
    JsonCastExpression,
    StringCastExpression,
} from './classes.js';

export function asInt(input: HyphenatedExpressionArgs): IntCastExpression {
    return new IntCastExpression(`asInt(${input})`);
}

export function asFloat(input: HyphenatedExpressionArgs): FloatCastExpression {
    return new FloatCastExpression(`asFloat(${input})`);
}

export function asString(input: HyphenatedExpressionArgs): StringCastExpression {
    return new StringCastExpression(`asString(${input})`);
}

export function toJson(input: HyphenatedExpressionArgs): JsonCastExpression {
    return new JsonCastExpression(`toJson(${input})`);
}
