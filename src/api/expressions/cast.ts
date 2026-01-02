import {
    FloatCastExpression,
    HyphenatedExpressionArgs,
    IntCastExpression,
    JsonCastExpression,
    StringCastExpression,
} from './interfaces.js';

export function asInt(input: HyphenatedExpressionArgs): IntCastExpression {
    return {
        output: `asInt(${input.output})`,
        isIntCastExpression: true,
    };
}

export function asFloat(input: HyphenatedExpressionArgs): FloatCastExpression {
    return {
        output: `asFloat(${input.output})`,
        isFloatCastExpression: true,
    };
}

export function asString(input: HyphenatedExpressionArgs): StringCastExpression {
    return {
        output: `string(${input.output})`,
        isStringCastExpression: true,
    };
}

export function toJson(input: HyphenatedExpressionArgs): JsonCastExpression {
    return {
        output: `toJson(${input.output})`,
        isJsonCastExpression: true,
    };
}
