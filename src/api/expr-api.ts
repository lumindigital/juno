import { ExpressionArgs, getVariableReference } from './expression.js';

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

        result += getVariableReference(input);
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

        result += getVariableReference(input);
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
    return `!${getVariableReference(input)}`;
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

export function equals(left: string | ExpressionArgs, right: string | ExpressionArgs): string {
    return `${getVariableReference(left)} == ${getVariableReference(right)}`;
}
