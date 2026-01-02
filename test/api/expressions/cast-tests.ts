import { expect } from 'chai';
import { DagTask } from '../../../src/api/dag-task';
import { asFloat, asInt, toJson } from '../../../src/api/expressions/cast';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('cast tests', (): void => {
    describe('asInt', (): void => {
        it('returns successfully', (): void => {
            const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
            const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

            const result = asInt(hyphenatedExpressionArgs);
            expect(result.output).to.equal(`asInt(tasks['A-1'].outputs.parameters['output-1'])`);
        });
    });

    describe('asFloat', (): void => {
        it('returns successfully', (): void => {
            const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
            const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

            const result = asFloat(hyphenatedExpressionArgs);
            expect(result.output).to.equal(`asFloat(tasks['A-1'].outputs.parameters['output-1'])`);
        });
    });

    describe('toJson', (): void => {
        it('returns successfully', (): void => {
            const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
            const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

            const result = toJson(hyphenatedExpressionArgs);
            expect(result.output).to.equal(`toJson(tasks['A-1'].outputs.parameters['output-1'])`);
        });
    });
});
