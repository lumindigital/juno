import {
    AllExpression,
    AnyExpression,
    ArrayConcatExpression,
    CountExpression,
    FilterExpression,
    FindExpression,
    FindIndexExpression,
    FindLastExpression,
    FindLastIndexExpression,
    FirstExpression,
    FlattenExpression,
    FromJsonCastExpression,
    GroupByExpression,
    HyphenatedExpressionArgs,
    JoinExpression,
    LastExpression,
    MapExpression,
    MeanExpression,
    MedianExpression,
    NoneExpression,
    OneExpression,
    ReduceExpression,
    ReverseExpression,
    SortByExpression,
    SortExpression,
    SumExpression,
    TakeExpression,
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

export function mean(input: ArrayInput): MeanExpression {
    return new MeanExpression(`mean(${resolveInput(input)})`);
}

export function median(input: ArrayInput): MedianExpression {
    return new MedianExpression(`median(${resolveInput(input)})`);
}

export function take(input: ArrayInput, n: number): TakeExpression {
    return new TakeExpression(`take(${resolveInput(input)}, ${n})`);
}

export function all(input: ArrayInput, predicate: string): AllExpression {
    return new AllExpression(`all(${resolveInput(input)}, ${predicate})`);
}

export function any(input: ArrayInput, predicate: string): AnyExpression {
    return new AnyExpression(`any(${resolveInput(input)}, ${predicate})`);
}

export function one(input: ArrayInput, predicate: string): OneExpression {
    return new OneExpression(`one(${resolveInput(input)}, ${predicate})`);
}

export function none(input: ArrayInput, predicate: string): NoneExpression {
    return new NoneExpression(`none(${resolveInput(input)}, ${predicate})`);
}

export function arrayMap(input: ArrayInput, predicate: string): MapExpression {
    return new MapExpression(`map(${resolveInput(input)}, ${predicate})`);
}

export function filter(input: ArrayInput, predicate: string): FilterExpression {
    return new FilterExpression(`filter(${resolveInput(input)}, ${predicate})`);
}

export function find(input: ArrayInput, predicate: string): FindExpression {
    return new FindExpression(`find(${resolveInput(input)}, ${predicate})`);
}

export function findIndex(input: ArrayInput, predicate: string): FindIndexExpression {
    return new FindIndexExpression(`findIndex(${resolveInput(input)}, ${predicate})`);
}

export function findLast(input: ArrayInput, predicate: string): FindLastExpression {
    return new FindLastExpression(`findLast(${resolveInput(input)}, ${predicate})`);
}

export function findLastIndex(input: ArrayInput, predicate: string): FindLastIndexExpression {
    return new FindLastIndexExpression(`findLastIndex(${resolveInput(input)}, ${predicate})`);
}

// This function has issues in argo workflow. It will not work by itself. In some cases it might work. For example toPairs(groupBy(["1","2","3"], { # })) will return a valid result but groupBy(["1","2","3"], { # }) fails.
export function groupBy(input: ArrayInput, predicate: string): GroupByExpression {
    return new GroupByExpression(`groupBy(${resolveInput(input)}, ${predicate})`);
}

export function count(input: ArrayInput, predicate?: string): CountExpression {
    const inputStr = resolveInput(input);

    if (predicate !== undefined) {
        return new CountExpression(`count(${inputStr}, ${predicate})`);
    }

    return new CountExpression(`count(${inputStr})`);
}

export function reduce(input: ArrayInput, predicate: string, initialValue?: string): ReduceExpression {
    const inputStr = resolveInput(input);

    if (initialValue !== undefined) {
        return new ReduceExpression(`reduce(${inputStr}, ${predicate}, ${initialValue})`);
    }

    return new ReduceExpression(`reduce(${inputStr}, ${predicate})`);
}

export function sum(input: ArrayInput, predicate?: string): SumExpression {
    const inputStr = resolveInput(input);

    if (predicate !== undefined) {
        return new SumExpression(`sum(${inputStr}, ${predicate})`);
    }

    return new SumExpression(`sum(${inputStr})`);
}

export function sortBy(input: ArrayInput, predicate: string, order?: 'asc' | 'desc'): SortByExpression {
    const inputStr = resolveInput(input);

    if (predicate !== undefined && order !== undefined) {
        return new SortByExpression(`sortBy(${inputStr}, ${predicate}, '${order}')`);
    }

    if (predicate !== undefined) {
        return new SortByExpression(`sortBy(${inputStr}, ${predicate})`);
    }

    return new SortByExpression(`sortBy(${inputStr})`);
}
