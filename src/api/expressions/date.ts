import {
    DateExpression,
    DurationExpression,
    HyphenatedExpressionArgs,
    NowExpression,
    TimezoneExpression,
} from './classes.js';
import { UndefinedExpressionArg } from './tag.js';

type DateInput = HyphenatedExpressionArgs | UndefinedExpressionArg;

function resolveInput(input: DateInput): string {
    if ((input as UndefinedExpressionArg)?.string) {
        return `'${(input as UndefinedExpressionArg).string}'`;
    }

    return `${input}`;
}

export function now(): NowExpression {
    return new NowExpression(`now()`);
}

export function duration(input: DateInput): DurationExpression {
    return new DurationExpression(`duration(${resolveInput(input)})`);
}

export function date(input: DateInput, format?: DateInput, tz?: DateInput): DateExpression {
    const args = [resolveInput(input)];

    if (format !== undefined) {
        args.push(resolveInput(format));
    }

    if (tz !== undefined) {
        args.push(resolveInput(tz));
    }

    return new DateExpression(`date(${args.join(', ')})`);
}

export function dateInTimezone(input: DateInput, tz: DateInput): TimezoneExpression {
    return new TimezoneExpression(`date(${resolveInput(input)}).In(timezone(${resolveInput(tz)}))`);
}
