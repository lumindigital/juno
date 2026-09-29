import {
    AbsExpression,
    ArithmeticExpressions,
    CeilExpression,
    FloatCastExpression,
    FloorExpression,
    HyphenatedExpressionArgs,
    IntCastExpression,
    LenExpression,
    MaxExpression,
    MinExpression,
    RoundExpression,
} from './classes.js';
import { UndefinedExpressionArg } from './tag.js';

type NumberInput =
    | HyphenatedExpressionArgs
    | UndefinedExpressionArg
    | ArithmeticExpressions
    | number
    | LenExpression
    | IntCastExpression
    | FloatCastExpression;

function resolveInput(input: NumberInput): string {
    if (typeof input === 'number') {
        return `${input}`;
    }

    if ((input as UndefinedExpressionArg)?.string) {
        return (input as UndefinedExpressionArg).string;
    }

    return `${input}`;
}

export function max(a: NumberInput, b: NumberInput): MaxExpression {
    return new MaxExpression(`max(${resolveInput(a)}, ${resolveInput(b)})`);
}

export function min(a: NumberInput, b: NumberInput): MinExpression {
    return new MinExpression(`min(${resolveInput(a)}, ${resolveInput(b)})`);
}

export function abs(input: NumberInput): AbsExpression {
    return new AbsExpression(`abs(${resolveInput(input)})`);
}

export function ceil(input: NumberInput): CeilExpression {
    return new CeilExpression(`ceil(${resolveInput(input)})`);
}

export function floor(input: NumberInput): FloorExpression {
    return new FloorExpression(`floor(${resolveInput(input)})`);
}

export function round(input: NumberInput): RoundExpression {
    return new RoundExpression(`round(${resolveInput(input)})`);
}
