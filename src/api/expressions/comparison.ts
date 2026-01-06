import {
    CastExpressions,
    ComparisonExpression,
    FloatCastExpression,
    HyphenatedExpressionArgs,
    IntCastExpression,
    JsonPathExpression,
    SimpleTemplateTag,
} from './classes.js';

const enum Comparators {
    EQUALS = '==',
    NOT_EQUALS = '!=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
}

export function equals<T extends HyphenatedExpressionArgs | SimpleTemplateTag | JsonPathExpression>(
    left: T,
    right: T | boolean | string,
): ComparisonExpression {
    return comparison(Comparators.EQUALS, left, right);
}

export function notEquals<T extends HyphenatedExpressionArgs | SimpleTemplateTag | JsonPathExpression>(
    left: T,
    right: T | boolean | string,
): ComparisonExpression {
    return comparison(Comparators.NOT_EQUALS, left, right);
}

export function greaterThan<T extends IntCastExpression | FloatCastExpression | JsonPathExpression>(
    left: T,
    right: T | boolean | string,
): ComparisonExpression {
    return comparison(Comparators.GREATER_THAN, left, right);
}

export function lessThan<T extends IntCastExpression | FloatCastExpression | JsonPathExpression>(
    left: T,
    right: T | boolean | string,
): ComparisonExpression {
    return comparison(Comparators.LESS_THAN, left, right);
}

export function greaterThanOrEqual<T extends IntCastExpression | FloatCastExpression | JsonPathExpression>(
    left: T,
    right: T | boolean | string,
): ComparisonExpression {
    return comparison(Comparators.GREATER_THAN_OR_EQUAL, left, right);
}

export function lessThanOrEqual<T extends IntCastExpression | FloatCastExpression | JsonPathExpression>(
    left: T,
    right: T | boolean | string,
): ComparisonExpression {
    return comparison(Comparators.LESS_THAN_OR_EQUAL, left, right);
}

function comparison<T extends HyphenatedExpressionArgs | SimpleTemplateTag | CastExpressions | JsonPathExpression>(
    operator: Comparators,
    left: T,
    right: T | boolean | string,
): ComparisonExpression {
    const leftSide = left.toString();
    let rightSide: string;

    if (typeof right === 'boolean') {
        // for now since the left side is always a parameter, we will wrap the boolean in quotes as parameters must always be either cast to a type or compared to strings
        rightSide = right ? `'true'` : `'false'`;
    } else if (typeof right === 'string') {
        rightSide = `${right}`;
    } else {
        rightSide = right.toString();
    }

    return new ComparisonExpression(`${leftSide} ${operator} ${rightSide}`);
}
