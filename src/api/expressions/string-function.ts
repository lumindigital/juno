import {
    FindExpression,
    FindLastExpression,
    HasPrefixExpression,
    HasSuffixExpression,
    HyphenatedExpressionArgs,
    IndexOfExpression,
    JoinExpression,
    JsonPathExpression,
    LastIndexOfExpression,
    LowerExpression,
    RepeatExpression,
    ReplaceExpression,
    SplitAfterExpression,
    SplitExpression,
    StringCastExpression,
    StringFunctionExpressions,
    TernaryExpression,
    ToJsonCastExpression,
    TrimExpression,
    TrimPrefixExpression,
    TrimSuffixExpression,
    UpperExpression,
} from './classes.js';
import { wrapStringInQuotes } from './util.js';

export type StringInputTypes =
    | HyphenatedExpressionArgs
    | StringCastExpression
    | JsonPathExpression
    | TernaryExpression
    | JoinExpression
    | ToJsonCastExpression
    | FindExpression
    | FindLastExpression;

export function lower(input: StringFunctionExpressions | StringInputTypes): LowerExpression {
    return new LowerExpression(`lower(${input})`);
}

export function upper(input: StringFunctionExpressions | StringInputTypes): UpperExpression {
    return new UpperExpression(`upper(${input})`);
}

export function trim(
    input: StringFunctionExpressions | StringInputTypes,
    chars?: StringInputTypes | string,
): TrimExpression {
    if (chars !== undefined) {
        if (typeof chars === 'string') {
            return new TrimExpression(`trim(${input}, ${wrapStringInQuotes(chars)})`);
        }

        return new TrimExpression(`trim(${input}, ${chars})`);
    }
    return new TrimExpression(`trim(${input})`);
}

export function trimPrefix(
    input: StringFunctionExpressions | StringInputTypes,
    prefix: StringInputTypes | string,
): TrimPrefixExpression {
    if (typeof prefix === 'string') {
        return new TrimPrefixExpression(`trimPrefix(${input}, ${wrapStringInQuotes(prefix)})`);
    }
    return new TrimPrefixExpression(`trimPrefix(${input}, ${prefix})`);
}

export function trimSuffix(
    input: StringFunctionExpressions | StringInputTypes,
    suffix: StringInputTypes | string,
): TrimSuffixExpression {
    if (typeof suffix === 'string') {
        return new TrimSuffixExpression(`trimSuffix(${input}, ${wrapStringInQuotes(suffix)})`);
    }
    return new TrimSuffixExpression(`trimSuffix(${input}, ${suffix})`);
}

export function replace(
    input: StringFunctionExpressions | StringInputTypes,
    oldStr: StringInputTypes | string,
    newStr: StringInputTypes | string,
): ReplaceExpression {
    const oldStrOutput = typeof oldStr === 'string' ? wrapStringInQuotes(oldStr) : oldStr;
    const newStrOutput = typeof newStr === 'string' ? wrapStringInQuotes(newStr) : newStr;
    return new ReplaceExpression(`replace(${input}, ${oldStrOutput}, ${newStrOutput})`);
}

export function repeat(input: StringFunctionExpressions | StringInputTypes, n: number): RepeatExpression {
    return new RepeatExpression(`repeat(${input}, ${n})`);
}

export function indexOf(
    input: StringFunctionExpressions | StringInputTypes,
    substring: StringInputTypes | string,
): IndexOfExpression {
    if (typeof substring === 'string') {
        return new IndexOfExpression(`indexOf(${input}, ${wrapStringInQuotes(substring)})`);
    }
    return new IndexOfExpression(`indexOf(${input}, ${substring})`);
}

export function lastIndexOf(
    input: StringFunctionExpressions | StringInputTypes,
    substring: StringInputTypes | string,
): LastIndexOfExpression {
    if (typeof substring === 'string') {
        return new LastIndexOfExpression(`lastIndexOf(${input}, ${wrapStringInQuotes(substring)})`);
    }
    return new LastIndexOfExpression(`lastIndexOf(${input}, ${substring})`);
}

export function hasPrefix(
    input: StringFunctionExpressions | StringInputTypes,
    prefix: StringInputTypes | string,
): HasPrefixExpression {
    if (typeof prefix === 'string') {
        return new HasPrefixExpression(`hasPrefix(${input}, ${wrapStringInQuotes(prefix)})`);
    }
    return new HasPrefixExpression(`hasPrefix(${input}, ${prefix})`);
}

export function hasSuffix(
    input: StringFunctionExpressions | StringInputTypes,
    suffix: StringInputTypes | string,
): HasSuffixExpression {
    if (typeof suffix === 'string') {
        return new HasSuffixExpression(`hasSuffix(${input}, ${wrapStringInQuotes(suffix)})`);
    }
    return new HasSuffixExpression(`hasSuffix(${input}, ${suffix})`);
}

export function split(
    input: StringFunctionExpressions | StringInputTypes,
    delimiter: StringInputTypes | string,
    n?: number,
): SplitExpression {
    const delimiterOutput = typeof delimiter === 'string' ? wrapStringInQuotes(delimiter) : delimiter;
    if (n !== undefined) {
        return new SplitExpression(`split(${input}, ${delimiterOutput}, ${n})`);
    }
    return new SplitExpression(`split(${input}, ${delimiterOutput})`);
}

export function splitAfter(
    input: StringFunctionExpressions | StringInputTypes,
    delimiter: StringInputTypes | string,
    n?: number,
): SplitAfterExpression {
    const delimiterOutput = typeof delimiter === 'string' ? wrapStringInQuotes(delimiter) : delimiter;
    if (n !== undefined) {
        return new SplitAfterExpression(`splitAfter(${input}, ${delimiterOutput}, ${n})`);
    }
    return new SplitAfterExpression(`splitAfter(${input}, ${delimiterOutput})`);
}
