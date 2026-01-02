export type ExpressionTemplateInputs = ComparisonExpression | TernaryExpression | LogicalExpression | ParenExpression;

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
