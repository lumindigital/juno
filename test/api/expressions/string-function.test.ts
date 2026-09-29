import { expect } from 'chai';
import { DagTask } from '../../../src/api/dag-task';
import { asString } from '../../../src/api/expressions/cast';
import { equals } from '../../../src/api/expressions/comparison';
import { ternary } from '../../../src/api/expressions/conditional';
import { jsonPath } from '../../../src/api/expressions/json-path';
import {
    lower,
    upper,
    trim,
    trimPrefix,
    trimSuffix,
    replace,
    repeat,
    indexOf,
    lastIndexOf,
    hasPrefix,
    hasSuffix,
    split,
    splitAfter,
} from '../../../src/api/expressions/string-function';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('string function tests', (): void => {
    const hyphenatedExpressionArgs = hyphenateExpressionArgs({
        dagTask: new DagTask('A-1', {}),
        output: new OutputParameter('output-1'),
    });

    const stringCastExpression = asString(hyphenatedExpressionArgs);
    const jsonPathExpression = jsonPath(
        {
            dagTask: new DagTask('A-1', {}),
            output: new OutputParameter('output-1'),
        },
        '$.test',
    );

    const ternaryExpression = ternary(equals(hyphenatedExpressionArgs, 'true'), 'true', 'false');

    describe('lower', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = lower(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`lower(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = lower(stringCastExpression);
            expect(result.toString()).to.equal(`lower(string(tasks['A-1'].outputs.parameters['output-1']))`);
        });

        it('returns successfully with a json path expression', (): void => {
            const result = lower(jsonPathExpression);
            expect(result.toString()).to.equal(
                `lower(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = lower(ternaryExpression);
            expect(result.toString()).to.equal(
                `lower(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false')`,
            );
        });
    });

    describe('upper', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = upper(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`upper(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = upper(stringCastExpression);
            expect(result.toString()).to.equal(`upper(string(tasks['A-1'].outputs.parameters['output-1']))`);
        });

        it('returns successfully with a json path expression', (): void => {
            const result = upper(jsonPathExpression);
            expect(result.toString()).to.equal(
                `upper(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = upper(ternaryExpression);
            expect(result.toString()).to.equal(
                `upper(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false')`,
            );
        });
    });

    describe('trim', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = trim(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`trim(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with optional chars parameter as string', (): void => {
            const result = trim(hyphenatedExpressionArgs, ' #');
            expect(result.toString()).to.equal(`trim(tasks['A-1'].outputs.parameters['output-1'], ' #')`);
        });

        it('returns successfully with optional chars parameter as expression', (): void => {
            const result = trim(hyphenatedExpressionArgs, jsonPathExpression);
            expect(result.toString()).to.equal(
                `trim(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = trim(stringCastExpression);
            expect(result.toString()).to.equal(`trim(string(tasks['A-1'].outputs.parameters['output-1']))`);
        });

        it('returns successfully with a json path expression', (): void => {
            const result = trim(jsonPathExpression);
            expect(result.toString()).to.equal(`trim(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`);
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = trim(ternaryExpression);
            expect(result.toString()).to.equal(
                `trim(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false')`,
            );
        });
    });

    describe('trimPrefix', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = trimPrefix(hyphenatedExpressionArgs, 'prefix-');
            expect(result.toString()).to.equal(`trimPrefix(tasks['A-1'].outputs.parameters['output-1'], 'prefix-')`);
        });

        it('returns successfully with prefix as expression', (): void => {
            const result = trimPrefix(hyphenatedExpressionArgs, jsonPathExpression);
            expect(result.toString()).to.equal(
                `trimPrefix(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = trimPrefix(stringCastExpression, 'prefix-');
            expect(result.toString()).to.equal(
                `trimPrefix(string(tasks['A-1'].outputs.parameters['output-1']), 'prefix-')`,
            );
        });

        it('returns successfully with a json path expression', (): void => {
            const result = trimPrefix(jsonPathExpression, 'prefix-');
            expect(result.toString()).to.equal(
                `trimPrefix(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 'prefix-')`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = trimPrefix(ternaryExpression, 'prefix-');
            expect(result.toString()).to.equal(
                `trimPrefix(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', 'prefix-')`,
            );
        });
    });

    describe('trimSuffix', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = trimSuffix(hyphenatedExpressionArgs, '-suffix');
            expect(result.toString()).to.equal(`trimSuffix(tasks['A-1'].outputs.parameters['output-1'], '-suffix')`);
        });

        it('returns successfully with suffix as expression', (): void => {
            const result = trimSuffix(hyphenatedExpressionArgs, jsonPathExpression);
            expect(result.toString()).to.equal(
                `trimSuffix(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = trimSuffix(stringCastExpression, '-suffix');
            expect(result.toString()).to.equal(
                `trimSuffix(string(tasks['A-1'].outputs.parameters['output-1']), '-suffix')`,
            );
        });

        it('returns successfully with a json path expression', (): void => {
            const result = trimSuffix(jsonPathExpression, '-suffix');
            expect(result.toString()).to.equal(
                `trimSuffix(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), '-suffix')`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = trimSuffix(ternaryExpression, '-suffix');
            expect(result.toString()).to.equal(
                `trimSuffix(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', '-suffix')`,
            );
        });
    });

    describe('replace', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = replace(hyphenatedExpressionArgs, 'old', 'new');
            expect(result.toString()).to.equal(`replace(tasks['A-1'].outputs.parameters['output-1'], 'old', 'new')`);
        });

        it('returns successfully with oldStr as expression', (): void => {
            const result = replace(hyphenatedExpressionArgs, jsonPathExpression, 'new');
            expect(result.toString()).to.equal(
                `replace(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 'new')`,
            );
        });

        it('returns successfully with newStr as expression', (): void => {
            const result = replace(hyphenatedExpressionArgs, 'old', jsonPathExpression);
            expect(result.toString()).to.equal(
                `replace(tasks['A-1'].outputs.parameters['output-1'], 'old', jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with both oldStr and newStr as expressions', (): void => {
            const result = replace(hyphenatedExpressionArgs, stringCastExpression, jsonPathExpression);
            expect(result.toString()).to.equal(
                `replace(tasks['A-1'].outputs.parameters['output-1'], string(tasks['A-1'].outputs.parameters['output-1']), jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = replace(stringCastExpression, 'old', 'new');
            expect(result.toString()).to.equal(
                `replace(string(tasks['A-1'].outputs.parameters['output-1']), 'old', 'new')`,
            );
        });

        it('returns successfully with a json path expression', (): void => {
            const result = replace(jsonPathExpression, 'old', 'new');
            expect(result.toString()).to.equal(
                `replace(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 'old', 'new')`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = replace(ternaryExpression, 'old', 'new');
            expect(result.toString()).to.equal(
                `replace(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', 'old', 'new')`,
            );
        });
    });

    describe('repeat', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = repeat(hyphenatedExpressionArgs, 3);
            expect(result.toString()).to.equal(`repeat(tasks['A-1'].outputs.parameters['output-1'], 3)`);
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = repeat(stringCastExpression, 5);
            expect(result.toString()).to.equal(`repeat(string(tasks['A-1'].outputs.parameters['output-1']), 5)`);
        });

        it('returns successfully with a json path expression', (): void => {
            const result = repeat(jsonPathExpression, 2);
            expect(result.toString()).to.equal(
                `repeat(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 2)`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = repeat(ternaryExpression, 4);
            expect(result.toString()).to.equal(
                `repeat(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', 4)`,
            );
        });
    });

    describe('indexOf', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = indexOf(hyphenatedExpressionArgs, 'search');
            expect(result.toString()).to.equal(`indexOf(tasks['A-1'].outputs.parameters['output-1'], 'search')`);
        });

        it('returns successfully with substring as expression', (): void => {
            const result = indexOf(hyphenatedExpressionArgs, jsonPathExpression);
            expect(result.toString()).to.equal(
                `indexOf(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = indexOf(stringCastExpression, 'search');
            expect(result.toString()).to.equal(
                `indexOf(string(tasks['A-1'].outputs.parameters['output-1']), 'search')`,
            );
        });

        it('returns successfully with a json path expression', (): void => {
            const result = indexOf(jsonPathExpression, 'search');
            expect(result.toString()).to.equal(
                `indexOf(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 'search')`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = indexOf(ternaryExpression, 'search');
            expect(result.toString()).to.equal(
                `indexOf(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', 'search')`,
            );
        });
    });

    describe('lastIndexOf', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = lastIndexOf(hyphenatedExpressionArgs, 'search');
            expect(result.toString()).to.equal(`lastIndexOf(tasks['A-1'].outputs.parameters['output-1'], 'search')`);
        });

        it('returns successfully with substring as expression', (): void => {
            const result = lastIndexOf(hyphenatedExpressionArgs, jsonPathExpression);
            expect(result.toString()).to.equal(
                `lastIndexOf(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = lastIndexOf(stringCastExpression, 'search');
            expect(result.toString()).to.equal(
                `lastIndexOf(string(tasks['A-1'].outputs.parameters['output-1']), 'search')`,
            );
        });

        it('returns successfully with a json path expression', (): void => {
            const result = lastIndexOf(jsonPathExpression, 'search');
            expect(result.toString()).to.equal(
                `lastIndexOf(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 'search')`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = lastIndexOf(ternaryExpression, 'search');
            expect(result.toString()).to.equal(
                `lastIndexOf(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', 'search')`,
            );
        });
    });

    describe('hasPrefix', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = hasPrefix(hyphenatedExpressionArgs, 'prefix');
            expect(result.toString()).to.equal(`hasPrefix(tasks['A-1'].outputs.parameters['output-1'], 'prefix')`);
        });

        it('returns successfully with prefix as expression', (): void => {
            const result = hasPrefix(hyphenatedExpressionArgs, jsonPathExpression);
            expect(result.toString()).to.equal(
                `hasPrefix(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = hasPrefix(stringCastExpression, 'prefix');
            expect(result.toString()).to.equal(
                `hasPrefix(string(tasks['A-1'].outputs.parameters['output-1']), 'prefix')`,
            );
        });

        it('returns successfully with a json path expression', (): void => {
            const result = hasPrefix(jsonPathExpression, 'prefix');
            expect(result.toString()).to.equal(
                `hasPrefix(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 'prefix')`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = hasPrefix(ternaryExpression, 'prefix');
            expect(result.toString()).to.equal(
                `hasPrefix(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', 'prefix')`,
            );
        });
    });

    describe('hasSuffix', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = hasSuffix(hyphenatedExpressionArgs, 'suffix');
            expect(result.toString()).to.equal(`hasSuffix(tasks['A-1'].outputs.parameters['output-1'], 'suffix')`);
        });

        it('returns successfully with suffix as expression', (): void => {
            const result = hasSuffix(hyphenatedExpressionArgs, jsonPathExpression);
            expect(result.toString()).to.equal(
                `hasSuffix(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = hasSuffix(stringCastExpression, 'suffix');
            expect(result.toString()).to.equal(
                `hasSuffix(string(tasks['A-1'].outputs.parameters['output-1']), 'suffix')`,
            );
        });

        it('returns successfully with a json path expression', (): void => {
            const result = hasSuffix(jsonPathExpression, 'suffix');
            expect(result.toString()).to.equal(
                `hasSuffix(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 'suffix')`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = hasSuffix(ternaryExpression, 'suffix');
            expect(result.toString()).to.equal(
                `hasSuffix(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', 'suffix')`,
            );
        });
    });

    describe('split', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = split(hyphenatedExpressionArgs, ',');
            expect(result.toString()).to.equal(`split(tasks['A-1'].outputs.parameters['output-1'], ',')`);
        });

        it('returns successfully with delimiter as expression', (): void => {
            const result = split(hyphenatedExpressionArgs, jsonPathExpression);
            expect(result.toString()).to.equal(
                `split(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with delimiter as expression and n parameter', (): void => {
            const result = split(hyphenatedExpressionArgs, jsonPathExpression, 3);
            expect(result.toString()).to.equal(
                `split(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 3)`,
            );
        });

        it('returns successfully with optional n parameter', (): void => {
            const result = split(hyphenatedExpressionArgs, ',', 3);
            expect(result.toString()).to.equal(`split(tasks['A-1'].outputs.parameters['output-1'], ',', 3)`);
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = split(stringCastExpression, ',');
            expect(result.toString()).to.equal(`split(string(tasks['A-1'].outputs.parameters['output-1']), ',')`);
        });

        it('returns successfully with a json path expression', (): void => {
            const result = split(jsonPathExpression, ',');
            expect(result.toString()).to.equal(
                `split(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), ',')`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = split(ternaryExpression, ',');
            expect(result.toString()).to.equal(
                `split(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', ',')`,
            );
        });
    });

    describe('splitAfter', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = splitAfter(hyphenatedExpressionArgs, ',');
            expect(result.toString()).to.equal(`splitAfter(tasks['A-1'].outputs.parameters['output-1'], ',')`);
        });

        it('returns successfully with delimiter as expression', (): void => {
            const result = splitAfter(hyphenatedExpressionArgs, jsonPathExpression);
            expect(result.toString()).to.equal(
                `splitAfter(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'))`,
            );
        });

        it('returns successfully with delimiter as expression and n parameter', (): void => {
            const result = splitAfter(hyphenatedExpressionArgs, jsonPathExpression, 2);
            expect(result.toString()).to.equal(
                `splitAfter(tasks['A-1'].outputs.parameters['output-1'], jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), 2)`,
            );
        });

        it('returns successfully with optional n parameter', (): void => {
            const result = splitAfter(hyphenatedExpressionArgs, ',', 2);
            expect(result.toString()).to.equal(`splitAfter(tasks['A-1'].outputs.parameters['output-1'], ',', 2)`);
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = splitAfter(stringCastExpression, ',');
            expect(result.toString()).to.equal(`splitAfter(string(tasks['A-1'].outputs.parameters['output-1']), ',')`);
        });

        it('returns successfully with a json path expression', (): void => {
            const result = splitAfter(jsonPathExpression, ',');
            expect(result.toString()).to.equal(
                `splitAfter(jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test'), ',')`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = splitAfter(ternaryExpression, ',');
            expect(result.toString()).to.equal(
                `splitAfter(tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false', ',')`,
            );
        });
    });
});
