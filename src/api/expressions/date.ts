import {
    DateExpression,
    DurationExpression,
    HyphenatedExpressionArgs,
    NowExpression,
    TimezoneExpression,
} from './classes.js';
import { UndefinedExpressionArg } from './tag.js';

type StringInput = HyphenatedExpressionArgs | UndefinedExpressionArg | string;

function resolveInput(input: StringInput): string {
    if (typeof input === 'string') {
        return `'${input}'`;
    }

    if ((input as UndefinedExpressionArg)?.string) {
        return (input as UndefinedExpressionArg).string;
    }

    return `${input}`;
}

export function now(): NowExpression {
    return new NowExpression(`now()`);
}

export function duration(input: StringInput): DurationExpression {
    return new DurationExpression(`duration(${resolveInput(input)})`);
}

export function date(input: StringInput, format?: StringInput, tz?: StringInput): DateExpression {
    const args = [resolveInput(input)];

    if (format !== undefined) {
        args.push(resolveInput(format));
    }

    if (tz !== undefined) {
        args.push(resolveInput(tz));
    }

    return new DateExpression(`date(${args.join(', ')})`);
}

export function timezone(input: StringInput): TimezoneExpression {
    return new TimezoneExpression(`timezone(${resolveInput(input)})`);
}
