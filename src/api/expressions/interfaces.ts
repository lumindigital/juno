export type ExpressionTemplateInputs =
    | ComparisonExpression
    | TernaryExpression
    | LogicalExpression
    | ParenExpression
    | CastExpressions;
export type CastExpressions =
    | IntCastExpression
    | FloatCastExpression
    | StringCastExpression
    | JsonCastExpression
    | NilCoalescingExpression;

export interface SimpleTemplateTag {
    output: string;
    isSimpleTagExpression: true;
}

export interface ExpressionTemplateTag {
    output: string;
    isExpressionTagExpression: true;
}

export interface ComparisonExpression {
    output: string;
    isComparisonExpression: true;
}

export interface TernaryExpression {
    output: string;
    isTernaryExpression: true;
}

export interface NilCoalescingExpression {
    output: string;
    isNilCoalescingExpression: true;
}

export interface HyphenatedExpressionArgs {
    output: string;
    isHyphenatedExpressionArgs: true;
}

export interface LogicalExpression {
    output: string;
    isLogicalExpression: true;
}

export interface ParenExpression {
    output: string;
    isParenExpression: true;
}

export interface IntCastExpression {
    output: string;
    isIntCastExpression: true;
}

export interface FloatCastExpression {
    output: string;
    isFloatCastExpression: true;
}

export interface StringCastExpression {
    output: string;
    isStringCastExpression: true;
}

export interface JsonCastExpression {
    output: string;
    isJsonCastExpression: true;
}
