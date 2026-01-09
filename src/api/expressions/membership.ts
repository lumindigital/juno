import { HyphenatedExpressionArgs, InMembershipExpression, JsonPathExpression } from './classes.js';
import { UndefinedExpressionArg } from './tag.js';
import { wrapStringInQuotes } from './util.js';

export function isIn(
    leftSide: HyphenatedExpressionArgs | UndefinedExpressionArg,
    rightSide: JsonPathExpression | UndefinedExpressionArg,
): InMembershipExpression {
    let leftSideOutput: string;
    let rightSideOutput: string;

    if ((leftSide as UndefinedExpressionArg)?.string) {
        leftSideOutput = wrapStringInQuotes((leftSide as UndefinedExpressionArg).string);
    } else {
        leftSideOutput = leftSide.toString();
    }

    if ((rightSide as UndefinedExpressionArg)?.string) {
        rightSideOutput = wrapStringInQuotes((rightSide as UndefinedExpressionArg).string);
    } else {
        rightSideOutput = rightSide.toString();
    }

    return new InMembershipExpression(`${leftSideOutput} in ${rightSideOutput}`);
}
