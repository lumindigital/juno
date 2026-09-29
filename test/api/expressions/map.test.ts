import { expect } from 'chai';

import { DagTask } from '../../../src/api/dag-task';
import { fromJson } from '../../../src/api/expressions/cast';
import { keys, values } from '../../../src/api/expressions/map';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('map tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('keys', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = keys(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`keys(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = keys({ string: 'myMap' });
            expect(result.toString()).to.equal(`keys(myMap)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = keys(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`keys(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('values', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = values(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`values(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = values({ string: 'myMap' });
            expect(result.toString()).to.equal(`values(myMap)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = values(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`values(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });
});
