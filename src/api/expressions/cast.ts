import {
    FloatCastExpression,
    FromBase64CastExpression,
    FromJsonCastExpression,
    HyphenatedExpressionArgs,
    IntCastExpression,
    JsonCastExpression,
    StringCastExpression,
    ToBase64CastExpression,
    ToPairsCastExpression,
    TypeCastExpression,
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

export function asString(input: HyphenatedExpressionArgs | UndefinedExpressionArg | number): StringCastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new StringCastExpression(`string(${(input as UndefinedExpressionArg).string})`);
    }

    return new StringCastExpression(`string(${input})`);
}

export function toJson(input: HyphenatedExpressionArgs | UndefinedExpressionArg): JsonCastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new JsonCastExpression(`toJSON(${(input as UndefinedExpressionArg).string})`);
    }

    return new JsonCastExpression(`toJSON(${input})`);
}

export function fromJson(input: HyphenatedExpressionArgs | UndefinedExpressionArg): FromJsonCastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new FromJsonCastExpression(`fromJSON(${(input as UndefinedExpressionArg).string})`);
    }

    return new FromJsonCastExpression(`fromJSON(${input})`);
}

export function asType(input: HyphenatedExpressionArgs | UndefinedExpressionArg): TypeCastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new TypeCastExpression(`type(${(input as UndefinedExpressionArg).string})`);
    }

    return new TypeCastExpression(`type(${input})`);
}

export function toBase64(input: HyphenatedExpressionArgs | UndefinedExpressionArg): ToBase64CastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new ToBase64CastExpression(`toBase64(${(input as UndefinedExpressionArg).string})`);
    }

    return new ToBase64CastExpression(`toBase64(${input})`);
}

export function fromBase64(input: HyphenatedExpressionArgs | UndefinedExpressionArg): FromBase64CastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new FromBase64CastExpression(`fromBase64(${(input as UndefinedExpressionArg).string})`);
    }

    return new FromBase64CastExpression(`fromBase64(${input})`);
}

export function toPairs(input: UndefinedExpressionArg | FromJsonCastExpression): ToPairsCastExpression {
    if ((input as UndefinedExpressionArg)?.string) {
        return new ToPairsCastExpression(`toPairs(${(input as UndefinedExpressionArg).string})`);
    }

    return new ToPairsCastExpression(`toPairs(${input})`);
}

// There doesn't seem to be a valid way to use this in argo workflows.
// export function fromPairs(input: HyphenatedExpressionArgs | UndefinedExpressionArg): FromPairsCastExpression {
//     if ((input as UndefinedExpressionArg)?.string) {
//         return new FromPairsCastExpression(`fromPairs(${(input as UndefinedExpressionArg).string})`);
//     }

//     return new FromPairsCastExpression(`fromPairs(${input})`);
// }
