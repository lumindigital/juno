import { ExpressionArgs, getVariableReference } from '../expression.js';
import {
    ExpressionTemplateInputs as ExpressionTagTemplateInputs,
    ExpressionTemplateTag,
    HyphenatedExpressionArgs,
    SimpleTemplateTag,
} from './classes.js';

export type UndefinedExpressionArg = {
    string: string;
};

export function expressionTag(input: ExpressionTagTemplateInputs): ExpressionTemplateTag {
    return new ExpressionTemplateTag(`{{=${input}}}`);
}

export function simpleTag(input: ExpressionArgs | UndefinedExpressionArg): SimpleTemplateTag {
    const output =
        input && (input as UndefinedExpressionArg).string
            ? (input as UndefinedExpressionArg).string
            : getVariableReference(input as ExpressionArgs);

    return new SimpleTemplateTag(`{{${output}}}`);
}

export function hyphenateExpressionArgs(input: ExpressionArgs): HyphenatedExpressionArgs {
    return new HyphenatedExpressionArgs(hyphen(getVariableReference(input)));
}

function hyphen(input: string): string {
    const split = input.split('.');
    let output = split[0];

    for (let i = 1; i < split.length; i++) {
        if (split[i].includes('[')) {
            output = output.concat(`.${split[i]}`);
            continue;
        }

        if (split[i].includes('-')) {
            output = output.concat(`['${split[i]}']`);
            continue;
        }
        output = output.concat(`.${split[i]}`);
    }

    return output;
}
