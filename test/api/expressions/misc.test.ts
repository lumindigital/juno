import { expect } from 'chai';
import { DagTask } from '../../../src/api/dag-task';
import { fromJson } from '../../../src/api/expressions/cast';
import { get, len } from '../../../src/api/expressions/misc';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('misc tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('len', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = len(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`len(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = len({ string: 'myArray' });
            expect(result.toString()).to.equal(`len(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = len(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`len(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('get', (): void => {
        it('returns successfully if expressionArg with numeric index', (): void => {
            const result = get(hyphenatedExpressionArgs, 0);
            expect(result.toString()).to.equal(`get(tasks['A-1'].outputs.parameters['output-1'], 0)`);
        });

        it('returns successfully if expressionArg with string key', (): void => {
            const result = get(hyphenatedExpressionArgs, 'key');
            expect(result.toString()).to.equal(`get(tasks['A-1'].outputs.parameters['output-1'], 'key')`);
        });

        it('returns successfully if string with numeric index', (): void => {
            const result = get({ string: 'myArray' }, 1);
            expect(result.toString()).to.equal(`get(myArray, 1)`);
        });

        it('returns successfully if string with string key', (): void => {
            const result = get({ string: 'myMap' }, 'name');
            expect(result.toString()).to.equal(`get(myMap, 'name')`);
        });

        it('returns successfully if fromJson expression with numeric index', (): void => {
            const result = get(fromJson(hyphenatedExpressionArgs), 0);
            expect(result.toString()).to.equal(`get(fromJSON(tasks['A-1'].outputs.parameters['output-1']), 0)`);
        });

        it('returns successfully if fromJson expression with string key', (): void => {
            const result = get(fromJson(hyphenatedExpressionArgs), 'key');
            expect(result.toString()).to.equal(`get(fromJSON(tasks['A-1'].outputs.parameters['output-1']), 'key')`);
        });
    });
});
