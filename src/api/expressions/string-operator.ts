import {
    StringFunctionExpressions,
    ContainsExpression,
    StartsWithExpression,
    EndsWithExpression,
    ConcatExpression,
} from './classes.js';
import { StringInputTypes } from './string-function.js';
import { wrapStringInQuotes } from './util.js';

export function contains(
    input: StringFunctionExpressions | StringInputTypes,
    substring: StringFunctionExpressions | StringInputTypes | string,
): ContainsExpression {
    if (typeof substring === 'string') {
        return new ContainsExpression(`${input} contains ${wrapStringInQuotes(substring.toString())}`);
    }

    return new ContainsExpression(`${input} contains ${substring}`);
}

export function startsWith(
    input: StringFunctionExpressions | StringInputTypes,
    prefix: StringFunctionExpressions | StringInputTypes | string,
): StartsWithExpression {
    if (typeof prefix === 'string') {
        return new StartsWithExpression(`${input} startsWith ${wrapStringInQuotes(prefix.toString())}`);
    }

    return new StartsWithExpression(`${input} startsWith ${prefix}`);
}

export function endsWith(
    input: StringFunctionExpressions | StringInputTypes,
    suffix: StringFunctionExpressions | StringInputTypes | string,
): EndsWithExpression {
    if (typeof suffix === 'string') {
        return new EndsWithExpression(`${input} endsWith ${wrapStringInQuotes(suffix.toString())}`);
    }

    return new EndsWithExpression(`${input} endsWith ${suffix}`);
}

export function concatenate(...inputs: (StringInputTypes | string | StringFunctionExpressions)[]): ConcatExpression {
    let output = '';

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (typeof input === 'string') {
            output = output.concat(wrapStringInQuotes(input));
        } else {
            output = output.concat(input.toString());
        }

        if (i < inputs.length - 1) {
            output = output.concat(' + ');
        }
    }
    return new ConcatExpression(output);
}
