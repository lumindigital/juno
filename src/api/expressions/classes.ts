import { FromItemProperty } from '../parameter.js';

export type ExpressionTemplateInputs =
    | ComparisonExpression
    | TernaryExpression
    | LogicalExpression
    | ParenExpression
    | CastExpressions
    | ArithmeticExpressions
    | JsonPathExpression
    | FromItemProperty
    | InMembershipExpression
    | StringFunctionExpressions
    | StringOperatorExpressions
    | MiscExpressions
    | NumberExpressions
    | MapExpressions
    | ArrayExpressions;

export type MiscExpressions = LenExpression | GetExpression;

export type MapExpressions = KeysExpression | ValuesExpression;

export type ArrayExpressions =
    | FirstExpression
    | LastExpression
    | FlattenExpression
    | ReverseExpression
    | SortExpression
    | UniqExpression
    | JoinExpression
    | ArrayConcatExpression;

export type NumberExpressions =
    | MaxExpression
    | MinExpression
    | AbsExpression
    | CeilExpression
    | FloorExpression
    | RoundExpression;

export type CastExpressions =
    | IntCastExpression
    | FloatCastExpression
    | StringCastExpression
    | JsonCastExpression
    | TypeCastExpression
    | FromJsonCastExpression
    | ToBase64CastExpression
    | FromBase64CastExpression
    | ToPairsCastExpression
    // | FromPairsCastExpression
    | NilCoalescingExpression;

export type ArithmeticExpressions =
    | AddExpression
    | SubtractExpression
    | MultiplyExpression
    | DivideExpression
    | ModulusExpression
    | ExponentExpression;

export type StringFunctionExpressions =
    | LowerExpression
    | UpperExpression
    | TrimExpression
    | TrimPrefixExpression
    | TrimSuffixExpression
    | ReplaceExpression
    | RepeatExpression
    | IndexOfExpression
    | LastIndexOfExpression
    | HasPrefixExpression
    | HasSuffixExpression
    | SplitExpression
    | SplitAfterExpression;

export type StringOperatorExpressions =
    | ConcatExpression
    | ContainsExpression
    | StartsWithExpression
    | EndsWithExpression;

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

export class TypeCastExpression {
    private output: string;
    isTypeCastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class FromJsonCastExpression {
    private output: string;
    isFromJsonCastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ToBase64CastExpression {
    private output: string;
    isToBase64CastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class FromBase64CastExpression {
    private output: string;
    isFromBase64CastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ToPairsCastExpression {
    private output: string;
    isToPairsCastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

// export class FromPairsCastExpression {
//     private output: string;
//     isFromPairsCastExpression: boolean = true;

//     constructor(output: string) {
//         this.output = output;
//     }

//     toString(): string {
//         return this.output;
//     }
// }

export class LenExpression {
    private output: string;
    isLenExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class GetExpression {
    private output: string;
    isGetExpression: boolean = true;

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

export class AddExpression {
    private output: string;
    isAddExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class SubtractExpression {
    private output: string;
    isSubtractExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class MultiplyExpression {
    private output: string;
    isMultiplyExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class DivideExpression {
    private output: string;
    isDivideExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}
export class ModulusExpression {
    private output: string;
    isModulusExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ExponentExpression {
    private output: string;
    isExponentExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class InMembershipExpression {
    private output: string;
    isInMembershipExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class LowerExpression {
    private output: string;
    isLowerExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ConcatExpression {
    private output: string;
    isConcatExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class UpperExpression {
    private output: string;
    isUpperExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class TrimExpression {
    private output: string;
    isTrimExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class TrimPrefixExpression {
    private output: string;
    isTrimPrefixExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class TrimSuffixExpression {
    private output: string;
    isTrimSuffixExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ReplaceExpression {
    private output: string;
    isReplaceExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class RepeatExpression {
    private output: string;
    isRepeatExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class IndexOfExpression {
    private output: string;
    isIndexOfExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class LastIndexOfExpression {
    private output: string;
    isLastIndexOfExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class HasPrefixExpression {
    private output: string;
    isHasPrefixExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class HasSuffixExpression {
    private output: string;
    isHasSuffixExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class SplitExpression {
    private output: string;
    isSplitExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class SplitAfterExpression {
    private output: string;
    isSplitAfterExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ContainsExpression {
    private output: string;
    isContainsExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class StartsWithExpression {
    private output: string;
    isStartsWithExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class EndsWithExpression {
    private output: string;
    isEndsWithExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class MaxExpression {
    private output: string;
    isMaxExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class MinExpression {
    private output: string;
    isMinExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class AbsExpression {
    private output: string;
    isAbsExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class CeilExpression {
    private output: string;
    isCeilExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class FloorExpression {
    private output: string;
    isFloorExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class RoundExpression {
    private output: string;
    isRoundExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class KeysExpression {
    private output: string;
    isKeysExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ValuesExpression {
    private output: string;
    isValuesExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class FirstExpression {
    private output: string;
    isFirstExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class LastExpression {
    private output: string;
    isLastExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class FlattenExpression {
    private output: string;
    isFlattenExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ReverseExpression {
    private output: string;
    isReverseExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class SortExpression {
    private output: string;
    isSortExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class UniqExpression {
    private output: string;
    isUniqExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class JoinExpression {
    private output: string;
    isJoinExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}

export class ArrayConcatExpression {
    private output: string;
    isArrayConcatExpression: boolean = true;

    constructor(output: string) {
        this.output = output;
    }

    toString(): string {
        return this.output;
    }
}
