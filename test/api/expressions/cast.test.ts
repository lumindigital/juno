import { expect } from 'chai';
import { DagTask } from '../../../src/api/dag-task';
import { asFloat, asInt, asString, toJson } from '../../../src/api/expressions/cast';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('cast tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('asInt', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = asInt(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`asInt(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = asInt({ string: '123' });
            expect(result.toString()).to.equal(`asInt(123)`);
        });
    });

    describe('asFloat', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = asFloat(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`asFloat(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = asFloat({ string: '123' });
            expect(result.toString()).to.equal(`asFloat(123)`);
        });
    });

    describe('toJson', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = toJson(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`toJson(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = toJson({ string: '{}' });
            expect(result.toString()).to.equal(`toJson({})`);
        });
    });

    describe('asString', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = asString(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`string(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = asString({ string: 'A' });
            expect(result.toString()).to.equal(`string(A)`);
        });
    });
});
