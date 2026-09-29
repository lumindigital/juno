import { expect } from 'chai';
import { DagTask } from '../../../src/api/dag-task';
import { abs, ceil, floor, max, min, round } from '../../../src/api/expressions/number';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('number tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('max', (): void => {
        it('returns successfully with two expression args', (): void => {
            const result = max(hyphenatedExpressionArgs, hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(
                `max(tasks['A-1'].outputs.parameters['output-1'], tasks['A-1'].outputs.parameters['output-1'])`,
            );
        });

        it('returns successfully with number args', (): void => {
            const result = max(10, 20);
            expect(result.toString()).to.equal(`max(10, 20)`);
        });

        it('returns successfully with string args', (): void => {
            const result = max({ string: 'a' }, { string: 'b' });
            expect(result.toString()).to.equal(`max(a, b)`);
        });

        it('returns successfully with mixed args', (): void => {
            const result = max(hyphenatedExpressionArgs, 5);
            expect(result.toString()).to.equal(`max(tasks['A-1'].outputs.parameters['output-1'], 5)`);
        });
    });

    describe('min', (): void => {
        it('returns successfully with two expression args', (): void => {
            const result = min(hyphenatedExpressionArgs, hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(
                `min(tasks['A-1'].outputs.parameters['output-1'], tasks['A-1'].outputs.parameters['output-1'])`,
            );
        });

        it('returns successfully with number args', (): void => {
            const result = min(10, 20);
            expect(result.toString()).to.equal(`min(10, 20)`);
        });

        it('returns successfully with string args', (): void => {
            const result = min({ string: 'a' }, { string: 'b' });
            expect(result.toString()).to.equal(`min(a, b)`);
        });
    });

    describe('abs', (): void => {
        it('returns successfully with expression arg', (): void => {
            const result = abs(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`abs(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with number', (): void => {
            const result = abs(-5);
            expect(result.toString()).to.equal(`abs(-5)`);
        });

        it('returns successfully with string', (): void => {
            const result = abs({ string: 'myVar' });
            expect(result.toString()).to.equal(`abs(myVar)`);
        });
    });

    describe('ceil', (): void => {
        it('returns successfully with expression arg', (): void => {
            const result = ceil(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`ceil(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with number', (): void => {
            const result = ceil(3.7);
            expect(result.toString()).to.equal(`ceil(3.7)`);
        });

        it('returns successfully with string', (): void => {
            const result = ceil({ string: 'myVar' });
            expect(result.toString()).to.equal(`ceil(myVar)`);
        });
    });

    describe('floor', (): void => {
        it('returns successfully with expression arg', (): void => {
            const result = floor(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`floor(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with number', (): void => {
            const result = floor(3.7);
            expect(result.toString()).to.equal(`floor(3.7)`);
        });

        it('returns successfully with string', (): void => {
            const result = floor({ string: 'myVar' });
            expect(result.toString()).to.equal(`floor(myVar)`);
        });
    });

    describe('round', (): void => {
        it('returns successfully with expression arg', (): void => {
            const result = round(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`round(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with number', (): void => {
            const result = round(3.5);
            expect(result.toString()).to.equal(`round(3.5)`);
        });

        it('returns successfully with string', (): void => {
            const result = round({ string: 'myVar' });
            expect(result.toString()).to.equal(`round(myVar)`);
        });
    });
});
