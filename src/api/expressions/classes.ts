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

export class SimpleTemplateTag {
    private output: string;
    isSimpleTagExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ExpressionTemplateTag {
    private output: string;
    isExpressionTagExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ComparisonExpression {
    private output: string;
    isComparisonExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class TernaryExpression {
    private output: string;
    isTernaryExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class NilCoalescingExpression {
    private output: string;
    isNilCoalescingExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class HyphenatedExpressionArgs {
    private output: string;
    isHyphenatedExpressionArgs: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class LogicalExpression {
    private output: string;
    isLogicalExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ParenExpression {
    private output: string;
    isParenExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class IntCastExpression {
    private output: string;
    isIntCastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class FloatCastExpression {
    private output: string;
    isFloatCastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class StringCastExpression {
    private output: string;
    isStringCastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class JsonCastExpression {
    private output: string;
    isJsonCastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class JsonPathExpression {
    private output: string;
    isJsonPathExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}
export class NilResult {
    isNilResult: boolean = true;

    toString(): string {
        return 'nil';
    }
}
