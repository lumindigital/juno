import {
    ArrayConcatExpression,
    FirstExpression,
    FlattenExpression,
    FromJsonCastExpression,
    HyphenatedExpressionArgs,
    JoinExpression,
    LastExpression,
    ReverseExpression,
    SortExpression,
    UniqExpression,
} from './classes.js';
import { UndefinedExpressionArg } from './tag.js';

type ArrayInput = HyphenatedExpressionArgs | UndefinedExpressionArg | FromJsonCastExpression;

function resolveInput(input: ArrayInput): string {
    if ((input as UndefinedExpressionArg)?.string) {
        return (input as UndefinedExpressionArg).string;
    }

    return `${input}`;
}

export function first(input: ArrayInput): FirstExpression {
    return new FirstExpression(`first(${resolveInput(input)})`);
}

export function last(input: ArrayInput): LastExpression {
    return new LastExpression(`last(${resolveInput(input)})`);
}

export function flatten(input: ArrayInput): FlattenExpression {
    return new FlattenExpression(`flatten(${resolveInput(input)})`);
}

export function reverse(input: ArrayInput): ReverseExpression {
    return new ReverseExpression(`reverse(${resolveInput(input)})`);
}

export function sort(input: ArrayInput): SortExpression {
    return new SortExpression(`sort(${resolveInput(input)})`);
}

export function uniq(input: ArrayInput): UniqExpression {
    return new UniqExpression(`uniq(${resolveInput(input)})`);
}

export function join(input: ArrayInput, delimiter?: string): JoinExpression {
    const inputStr = resolveInput(input);

    if (delimiter !== undefined) {
        return new JoinExpression(`join(${inputStr}, '${delimiter}')`);
    }

    return new JoinExpression(`join(${inputStr})`);
}

export function arrayConcat(...inputs: ArrayInput[]): ArrayConcatExpression {
    const resolved = inputs.map((i) => resolveInput(i));
    return new ArrayConcatExpression(`concat(${resolved.join(', ')})`);
}
