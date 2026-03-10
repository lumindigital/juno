import { expect } from 'chai';
import { DagTask } from '../../../src/api/dag-task';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';
import { concatenate, contains, endsWith, startsWith } from '../../../src/api/expressions/string-operator';
import { asString } from '../../../src/api/expressions/cast';
import { jsonPath } from '../../../src/api/expressions/json-path';
import { ternary } from '../../../src/api/expressions/conditional';
import { equals } from '../../../src/api/expressions/comparison';

describe('string operator tests', (): void => {
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

    describe('contains', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = contains(hyphenatedExpressionArgs, 'search');
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] contains 'search'`);
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = contains(stringCastExpression, 'search');
            expect(result.toString()).to.equal(`string(tasks['A-1'].outputs.parameters['output-1']) contains 'search'`);
        });

        it('returns successfully with a json path expression', (): void => {
            const result = contains(jsonPathExpression, 'search');
            expect(result.toString()).to.equal(
                `jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test') contains 'search'`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = contains(ternaryExpression, 'search');
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false' contains 'search'`,
            );
        });

        it('returns successfully with a hyphenated expression arg and a hyphenated expression arg', (): void => {
            const result = contains(hyphenatedExpressionArgs, hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] contains tasks['A-1'].outputs.parameters['output-1']`,
            );
        });
    });

    describe('startsWith', (): void => {
        it('returns successfully with a hyphenated expression arg and a string', (): void => {
            const result = startsWith(hyphenatedExpressionArgs, 'prefix');
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] startsWith 'prefix'`);
        });

        it('returns successfully with a string cast expression and a string', (): void => {
            const result = startsWith(stringCastExpression, 'prefix');
            expect(result.toString()).to.equal(
                `string(tasks['A-1'].outputs.parameters['output-1']) startsWith 'prefix'`,
            );
        });

        it('returns successfully with a json path expression and a string', (): void => {
            const result = startsWith(jsonPathExpression, 'prefix');
            expect(result.toString()).to.equal(
                `jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test') startsWith 'prefix'`,
            );
        });

        it('returns successfully with a ternary expression and a string', (): void => {
            const result = startsWith(ternaryExpression, 'prefix');
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false' startsWith 'prefix'`,
            );
        });

        it('returns successfully with a hyphenated expression arg and a hyphenated expression arg', (): void => {
            const result = startsWith(hyphenatedExpressionArgs, hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] startsWith tasks['A-1'].outputs.parameters['output-1']`,
            );
        });
    });

    describe('endsWith', (): void => {
        it('returns successfully with a hyphenated expression arg', (): void => {
            const result = endsWith(hyphenatedExpressionArgs, 'suffix');
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] endsWith 'suffix'`);
        });

        it('returns successfully with a string cast expression', (): void => {
            const result = endsWith(stringCastExpression, 'suffix');
            expect(result.toString()).to.equal(`string(tasks['A-1'].outputs.parameters['output-1']) endsWith 'suffix'`);
        });

        it('returns successfully with a json path expression', (): void => {
            const result = endsWith(jsonPathExpression, 'suffix');
            expect(result.toString()).to.equal(
                `jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test') endsWith 'suffix'`,
            );
        });

        it('returns successfully with a ternary expression', (): void => {
            const result = endsWith(ternaryExpression, 'suffix');
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false' endsWith 'suffix'`,
            );
        });

        it('returns successfully with a hyphenated expression arg and a hyphenated expression arg', (): void => {
            const result = endsWith(hyphenatedExpressionArgs, hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] endsWith tasks['A-1'].outputs.parameters['output-1']`,
            );
        });
    });

    describe('concat', (): void => {
        it('returns successfully with a combination of strings and expression inputs', (): void => {
            const result = concatenate(
                hyphenatedExpressionArgs,
                stringCastExpression,
                jsonPathExpression,
                ternaryExpression,
                'staticString',
            );
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] + string(tasks['A-1'].outputs.parameters['output-1']) + jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$.test') + tasks['A-1'].outputs.parameters['output-1'] == 'true' ? 'true' : 'false' + 'staticString'`,
            );
        });
    });
});
