import { expect } from 'chai';

import { DagTask } from '../../../src/api/dag-task';
import { fromJson } from '../../../src/api/expressions/cast';
import { arrayConcat, first, flatten, join, last, reverse, sort, uniq } from '../../../src/api/expressions/array';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('array tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('first', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = first(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`first(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = first({ string: 'myArray' });
            expect(result.toString()).to.equal(`first(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = first(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`first(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('last', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = last(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`last(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = last({ string: 'myArray' });
            expect(result.toString()).to.equal(`last(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = last(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`last(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('flatten', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = flatten(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`flatten(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = flatten({ string: 'myArray' });
            expect(result.toString()).to.equal(`flatten(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = flatten(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`flatten(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('reverse', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = reverse(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`reverse(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = reverse({ string: 'myArray' });
            expect(result.toString()).to.equal(`reverse(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = reverse(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`reverse(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('sort', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = sort(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`sort(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = sort({ string: 'myArray' });
            expect(result.toString()).to.equal(`sort(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = sort(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`sort(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('uniq', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = uniq(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`uniq(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = uniq({ string: 'myArray' });
            expect(result.toString()).to.equal(`uniq(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = uniq(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`uniq(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('join', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = join(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`join(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = join({ string: 'myArray' });
            expect(result.toString()).to.equal(`join(myArray)`);
        });

        it('returns successfully with delimiter', (): void => {
            const result = join(hyphenatedExpressionArgs, ', ');
            expect(result.toString()).to.equal(`join(tasks['A-1'].outputs.parameters['output-1'], ', ')`);
        });

        it('returns successfully if fromJson expression with delimiter', (): void => {
            const result = join(fromJson(hyphenatedExpressionArgs), '-');
            expect(result.toString()).to.equal(`join(fromJSON(tasks['A-1'].outputs.parameters['output-1']), '-')`);
        });
    });

    describe('arrayConcat', (): void => {
        it('returns successfully with two expressionArgs', (): void => {
            const expressionArg2 = {
                dagTask: new DagTask('B-1', {}),
                output: new OutputParameter('output-2'),
            };
            const hyphenatedExpressionArgs2 = hyphenateExpressionArgs(expressionArg2);
            const result = arrayConcat(hyphenatedExpressionArgs, hyphenatedExpressionArgs2);
            expect(result.toString()).to.equal(
                `concat(tasks['A-1'].outputs.parameters['output-1'], tasks['B-1'].outputs.parameters['output-2'])`,
            );
        });

        it('returns successfully with string inputs', (): void => {
            const result = arrayConcat({ string: 'array1' }, { string: 'array2' });
            expect(result.toString()).to.equal(`concat(array1, array2)`);
        });

        it('returns successfully with fromJson expressions', (): void => {
            const result = arrayConcat(fromJson(hyphenatedExpressionArgs), fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(
                `concat(fromJSON(tasks['A-1'].outputs.parameters['output-1']), fromJSON(tasks['A-1'].outputs.parameters['output-1']))`,
            );
        });
    });
});
