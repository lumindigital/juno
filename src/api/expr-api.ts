import { ExpressionArgs, getVariableReference, hyphenParameter } from './expression.js';

/**
 * Adds a logical AND between multiple expressions.
 *
 * @param input - A valid {@link ExpressionArgs} object
 *
 * @returns A string representation of the AND expression
 * @public
 */
export function and(inputs: (string | ExpressionArgs)[]): string {
    let result = '';

    for (let i = 0; i < inputs.length; i++) {
        if (i !== 0) {
            result += ' && ';
        }

        const input = inputs[i];

        if (typeof input === 'string') {
            result += input;
            continue;
        }

        result += hyphenParameter(input);
    }

    return result;
}

/**
 * Adds a logical OR between multiple expressions.
 *
 * @param input - A valid {@link ExpressionArgs} object
 *
 * @returns A string representation of the OR expression
 * @public
 */
export function or(inputs: (string | ExpressionArgs)[]): string {
    let result = '';

    for (let i = 0; i < inputs.length; i++) {
        if (i !== 0) {
            result += ' || ';
        }

        const input = inputs[i];

        if (typeof input === 'string') {
            result += input;
            continue;
        }

        result += hyphenParameter(input);
    }

    return result;
}

/**
 * Adds a logical NOT to an expression.
 *
 * @param input - A valid {@link ExpressionArgs} object
 *
 * @returns A string representation of the negated expression
 * @public
 */
export function not(input: string | ExpressionArgs): string {
    if (typeof input === 'string') {
        return `!${input}`;
    }

    return `!${hyphenParameter(input)}`;
}

/**
 * Wraps an expression in parentheses.
 *
 * @param input - A valid expression string
 *
 * @returns A string wrapped in parentheses
 * @public
 */
export function paren(input: string): string {
    return `( ${input} )`;
}

export function equals(left: string | ExpressionArgs | boolean, right: string | ExpressionArgs | boolean): string {
    return comparison('==', left, right);
}

export function notEquals(left: string | ExpressionArgs | boolean, right: string | ExpressionArgs | boolean): string {
    return comparison('!=', left, right);
}

export function greaterThan(left: string | ExpressionArgs | boolean, right: string | ExpressionArgs | boolean): string {
    return comparison('>', left, right);
}

export function lessThan(left: string | ExpressionArgs | boolean, right: string | ExpressionArgs | boolean): string {
    return comparison('<', left, right);
}

export function greaterThanOrEqual(
    left: string | ExpressionArgs | boolean,
    right: string | ExpressionArgs | boolean,
): string {
    return comparison('>=', left, right);
}

export function lessThanOrEqual(
    left: string | ExpressionArgs | boolean,
    right: string | ExpressionArgs | boolean,
): string {
    return comparison('<=', left, right);
}

export function ternary(
    condition: string | ExpressionArgs | boolean,
    whenTrue: string | ExpressionArgs | boolean,
    whenFalse: string | ExpressionArgs | boolean,
): string {
    const conditionOutput =
        typeof condition === 'string'
            ? `${condition}`
            : typeof condition === 'boolean'
              ? `'${condition}'`
              : getVariableReference(condition);
    const whenTrueOutput =
        typeof whenTrue === 'string'
            ? `${whenTrue}`
            : typeof whenTrue === 'boolean'
              ? `'${whenTrue}'`
              : getVariableReference(whenTrue);
    const whenFalseOutput =
        typeof whenFalse === 'string'
            ? `${whenFalse}`
            : typeof whenFalse === 'boolean'
              ? `'${whenFalse}'`
              : getVariableReference(whenFalse);
    return `${conditionOutput} ? ${whenTrueOutput} : ${whenFalseOutput}`;
}

function comparison(
    operator: string,
    left: string | ExpressionArgs | boolean,
    right: string | ExpressionArgs | boolean,
): string {
    const leftSide =
        typeof left === 'string' ? `${left}` : typeof left === 'boolean' ? `'${left}'` : getVariableReference(left);
    const rightSide =
        typeof right === 'string'
            ? `${right}`
            : typeof right === 'boolean'
              ? `'${right}'`
              : getVariableReference(right);

    return `${leftSide} ${operator} ${rightSide}`;
}
