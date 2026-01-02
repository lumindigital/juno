import { expect } from 'chai';
import {
    equals,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    notEquals,
} from '../../../src/api/expressions/comparison';
import { DagTask } from '../../../src/api/dag-task';
import { OutputParameter } from '../../../src/api/parameter';
import { hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';

describe('comparison tests', (): void => {
    const expressionArg1 = { dagTask: new DagTask('A', {}), output: new OutputParameter('output1') };
    const expressionArg2 = { dagTask: new DagTask('B', {}), output: new OutputParameter('output2') };

    const simpleTemplateTag1 = simpleTag(expressionArg1);
    const simpleTemplateTag2 = simpleTag(expressionArg2);

    const expressionArg3 = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const expressionArg4 = { dagTask: new DagTask('B-1', {}), output: new OutputParameter('output-2') };

    const hyphenatedExpressionArgs1 = hyphenateExpressionArgs(expressionArg3);
    const hyphenatedExpressionArgs2 = hyphenateExpressionArgs(expressionArg4);

    describe('equals', (): void => {
        it('returns successfully when comparing simpleTags', (): void => {
            const result = equals(simpleTemplateTag1, simpleTemplateTag2);
            expect(result.output).to.equal(
                '{{tasks.A.outputs.parameters.output1}} == {{tasks.B.outputs.parameters.output2}}',
            );
        });

        it('returns successfully when comparing hyphenateExpressionArgs', (): void => {
            const result = equals(hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.output).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] == tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when comparing simpleTag and boolean', (): void => {
            const result = equals(simpleTemplateTag1, true);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} == 'true'`);
        });

        it('returns successfully when comparing simpleTag and string', (): void => {
            const result = equals(simpleTemplateTag1, `'true'`);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} == 'true'`);
        });
    });

    describe('notEquals', (): void => {
        it('returns successfully when comparing simpleTags', (): void => {
            const result = notEquals(simpleTemplateTag1, simpleTemplateTag2);
            expect(result.output).to.equal(
                '{{tasks.A.outputs.parameters.output1}} != {{tasks.B.outputs.parameters.output2}}',
            );
        });

        it('returns successfully when comparing hyphenateExpressionArgs', (): void => {
            const result = notEquals(hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.output).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] != tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when comparing simpleTag and boolean', (): void => {
            const result = notEquals(simpleTemplateTag1, true);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} != 'true'`);
        });

        it('returns successfully when comparing simpleTag and string', (): void => {
            const result = notEquals(simpleTemplateTag1, `'true'`);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} != 'true'`);
        });
    });

    describe('greaterThan', (): void => {
        it('returns successfully when comparing simpleTags', (): void => {
            const result = greaterThan(simpleTemplateTag1, simpleTemplateTag2);
            expect(result.output).to.equal(
                '{{tasks.A.outputs.parameters.output1}} > {{tasks.B.outputs.parameters.output2}}',
            );
        });

        it('returns successfully when comparing hyphenateExpressionArgs', (): void => {
            const result = greaterThan(hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.output).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] > tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when comparing simpleTag and boolean', (): void => {
            const result = greaterThan(simpleTemplateTag1, true);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} > 'true'`);
        });

        it('returns successfully when comparing simpleTag and string', (): void => {
            const result = greaterThan(simpleTemplateTag1, `'true'`);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} > 'true'`);
        });
    });

    describe('lessThan', (): void => {
        it('returns successfully when comparing simpleTags', (): void => {
            const result = lessThan(simpleTemplateTag1, simpleTemplateTag2);
            expect(result.output).to.equal(
                '{{tasks.A.outputs.parameters.output1}} < {{tasks.B.outputs.parameters.output2}}',
            );
        });

        it('returns successfully when comparing hyphenateExpressionArgs', (): void => {
            const result = lessThan(hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.output).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] < tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when comparing simpleTag and boolean', (): void => {
            const result = lessThan(simpleTemplateTag1, true);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} < 'true'`);
        });

        it('returns successfully when comparing simpleTag and string', (): void => {
            const result = lessThan(simpleTemplateTag1, `'true'`);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} < 'true'`);
        });
    });

    describe('greaterThanOrEqual', (): void => {
        it('returns successfully when comparing simpleTags', (): void => {
            const result = greaterThanOrEqual(simpleTemplateTag1, simpleTemplateTag2);
            expect(result.output).to.equal(
                '{{tasks.A.outputs.parameters.output1}} >= {{tasks.B.outputs.parameters.output2}}',
            );
        });

        it('returns successfully when comparing hyphenateExpressionArgs', (): void => {
            const result = greaterThanOrEqual(hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.output).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] >= tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when comparing simpleTag and boolean', (): void => {
            const result = greaterThanOrEqual(simpleTemplateTag1, true);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} >= 'true'`);
        });

        it('returns successfully when comparing simpleTag and string', (): void => {
            const result = greaterThanOrEqual(simpleTemplateTag1, `'true'`);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} >= 'true'`);
        });
    });

    describe('lessThanOrEqual', (): void => {
        it('returns successfully when comparing simpleTags', (): void => {
            const result = lessThanOrEqual(simpleTemplateTag1, simpleTemplateTag2);
            expect(result.output).to.equal(
                '{{tasks.A.outputs.parameters.output1}} <= {{tasks.B.outputs.parameters.output2}}',
            );
        });

        it('returns successfully when comparing hyphenateExpressionArgs', (): void => {
            const result = lessThanOrEqual(hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.output).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] <= tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when comparing simpleTag and boolean', (): void => {
            const result = lessThanOrEqual(simpleTemplateTag1, true);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} <= 'true'`);
        });

        it('returns successfully when comparing simpleTag and string', (): void => {
            const result = lessThanOrEqual(simpleTemplateTag1, `'true'`);
            expect(result.output).to.equal(`{{tasks.A.outputs.parameters.output1}} <= 'true'`);
        });
    });
});
