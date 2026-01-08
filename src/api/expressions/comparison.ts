import {
    CastExpressions,
    ComparisonExpression,
    FloatCastExpression,
    HyphenatedExpressionArgs,
    IntCastExpression,
    JsonPathExpression,
    NilResult,
    SimpleTemplateTag,
    StringCastExpression,
} from './classes.js';
import { UndefinedExpressionArg } from './tag.js';
import { TaskResult } from './types.js';

const enum Comparators {
    EQUALS = '==',
    NOT_EQUALS = '!=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
}

export type LeftNumericComparisonTypes =
    | IntCastExpression
    | FloatCastExpression
    | JsonPathExpression
    | UndefinedExpressionArg;

export type LeftEqualityComparisonTypes =
    | LeftNumericComparisonTypes
    | HyphenatedExpressionArgs
    | SimpleTemplateTag
    | JsonPathExpression
    | UndefinedExpressionArg
    | StringCastExpression;
export type RightEqualityComparisonTypes =
    | LeftEqualityComparisonTypes
    | boolean
    | string
    | number
    | NilResult
    | TaskResult;

export type RightNumericComparisonTypes = LeftNumericComparisonTypes | boolean | number | NilResult;

export function equals<T extends LeftEqualityComparisonTypes>(
    left: T,
    right: RightEqualityComparisonTypes,
): ComparisonExpression {
    return comparison(Comparators.EQUALS, left, right);
}

export function notEquals<T extends LeftEqualityComparisonTypes>(
    left: T,
    right: RightEqualityComparisonTypes,
): ComparisonExpression {
    return comparison(Comparators.NOT_EQUALS, left, right);
}

export function greaterThan<T extends LeftNumericComparisonTypes>(
    left: T,
    right: RightNumericComparisonTypes,
): ComparisonExpression {
    return comparison(Comparators.GREATER_THAN, left, right);
}

export function lessThan<T extends LeftNumericComparisonTypes>(
    left: T,
    right: RightNumericComparisonTypes,
): ComparisonExpression {
    return comparison(Comparators.LESS_THAN, left, right);
}

export function greaterThanOrEqual<T extends LeftNumericComparisonTypes>(
    left: T,
    right: RightNumericComparisonTypes,
): ComparisonExpression {
    return comparison(Comparators.GREATER_THAN_OR_EQUAL, left, right);
}

export function lessThanOrEqual<T extends LeftNumericComparisonTypes>(
    left: T,
    right: RightNumericComparisonTypes,
): ComparisonExpression {
    return comparison(Comparators.LESS_THAN_OR_EQUAL, left, right);
}

function comparison<
    T extends
        | HyphenatedExpressionArgs
        | SimpleTemplateTag
        | CastExpressions
        | JsonPathExpression
        | UndefinedExpressionArg,
>(
    operator: Comparators,
    left: T,
    right: RightEqualityComparisonTypes | RightNumericComparisonTypes,
): ComparisonExpression {
    let leftSide: string;

    if ((left as UndefinedExpressionArg)?.string) {
        leftSide = (left as UndefinedExpressionArg).string;
    } else {
        leftSide = left.toString();
    }
    let rightSide: string;

    if (typeof right === 'boolean') {
        if ((left as SimpleTemplateTag)?.isSimpleTagExpression) {
            // if comparing a simple tag expression, we do not wrap the string in quotes (govaluate)
            rightSide = right ? 'true' : 'false';
        } else {
            rightSide = `'${right}'`;
        }
    } else if (typeof right === 'string') {
        if ((left as SimpleTemplateTag)?.isSimpleTagExpression) {
            // if comparing a simple tag expression, we do not wrap the string in quotes
            rightSide = right;
        } else {
            rightSide = `'${right}'`;
        }
    } else if ((right as NilResult)?.isNilResult) {
        rightSide = right.toString();
    } else {
        rightSide = right.toString();
    }

    return new ComparisonExpression(`${leftSide} ${operator} ${rightSide}`);
}
