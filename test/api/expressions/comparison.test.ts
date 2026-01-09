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
import { asFloat, asInt } from '../../../src/api/expressions/cast';
import { NilResult } from '../../../src/api/expressions/classes';

describe('comparison tests', (): void => {
    const expressionArg1 = { dagTask: new DagTask('A', {}), output: new OutputParameter('output1') };
    const expressionArg2 = { dagTask: new DagTask('B', {}), output: new OutputParameter('output2') };

    const simpleTemplateTag1 = simpleTag(expressionArg1);
    const simpleTemplateTag2 = simpleTag(expressionArg2);

    const asIntExpression1 = asInt(hyphenateExpressionArgs(expressionArg1));
    const asIntExpression2 = asInt(hyphenateExpressionArgs(expressionArg2));

    const asFloatExpression1 = asFloat(hyphenateExpressionArgs(expressionArg1));
    const asFloatExpression2 = asFloat(hyphenateExpressionArgs(expressionArg2));

    const expressionArg3 = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const expressionArg4 = { dagTask: new DagTask('B-1', {}), output: new OutputParameter('output-2') };

    const hyphenatedExpressionArgs1 = hyphenateExpressionArgs(expressionArg3);
    const hyphenatedExpressionArgs2 = hyphenateExpressionArgs(expressionArg4);

    describe('equals', (): void => {
        it('returns successfully when comparing simpleTags', (): void => {
            const result = equals(simpleTemplateTag1, simpleTemplateTag2);
            expect(result.toString()).to.equal(
                '{{tasks.A.outputs.parameters.output1}} == {{tasks.B.outputs.parameters.output2}}',
            );
        });

        it('returns successfully when comparing hyphenateExpressionArgs', (): void => {
            const result = equals(hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] == tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when comparing hyphenatedExpressionArgs and boolean', (): void => {
            const result = equals(hyphenatedExpressionArgs1, true);
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] == 'true'`);
        });

        it('returns successfully when comparing hyphenatedExpressionArgs and string', (): void => {
            const result = equals(hyphenatedExpressionArgs1, 'true');
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] == 'true'`);
        });

        it('returns successfully when comparing hyphenatedExpressionArgs and boolean', (): void => {
            const result = equals(hyphenatedExpressionArgs1, true);
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] == 'true'`);
        });

        it('returns successfully when comparing simpleTag and string', (): void => {
            const result = equals(simpleTemplateTag1, 'true');
            expect(result.toString()).to.equal(`{{tasks.A.outputs.parameters.output1}} == true`);
        });

        it('returns successfully when comparing simpleTag and boolean', (): void => {
            const result = equals(simpleTemplateTag1, true);
            expect(result.toString()).to.equal(`{{tasks.A.outputs.parameters.output1}} == true`);
        });

        it('returns successfully when comparing simpleTag and nil', (): void => {
            const result = equals(simpleTemplateTag1, new NilResult());
            expect(result.toString()).to.equal(`{{tasks.A.outputs.parameters.output1}} == nil`);
        });
    });

    describe('notEquals', (): void => {
        it('returns successfully when comparing simpleTags', (): void => {
            const result = notEquals(simpleTemplateTag1, simpleTemplateTag2);
            expect(result.toString()).to.equal(
                '{{tasks.A.outputs.parameters.output1}} != {{tasks.B.outputs.parameters.output2}}',
            );
        });

        it('returns successfully when comparing hyphenateExpressionArgs', (): void => {
            const result = notEquals(hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] != tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when comparing hyphenatedExpressionArgs and boolean', (): void => {
            const result = notEquals(hyphenatedExpressionArgs1, true);
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] != 'true'`);
        });

        it('returns successfully when comparing hyphenatedExpressionArgs and string', (): void => {
            const result = notEquals(hyphenatedExpressionArgs1, 'true');
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] != 'true'`);
        });

        it('returns successfully when comparing hyphenatedExpressionArgs and boolean', (): void => {
            const result = notEquals(hyphenatedExpressionArgs1, true);
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] != 'true'`);
        });

        it('returns successfully when comparing simpleTag and string', (): void => {
            const result = notEquals(simpleTemplateTag1, 'true');
            expect(result.toString()).to.equal(`{{tasks.A.outputs.parameters.output1}} != true`);
        });

        it('returns successfully when comparing simpleTag and boolean', (): void => {
            const result = notEquals(simpleTemplateTag1, true);
            expect(result.toString()).to.equal(`{{tasks.A.outputs.parameters.output1}} != true`);
        });

        it('returns successfully when comparing simpleTag and nil', (): void => {
            const result = notEquals(simpleTemplateTag1, new NilResult());
            expect(result.toString()).to.equal(`{{tasks.A.outputs.parameters.output1}} != nil`);
        });
    });

    describe('greaterThan', (): void => {
        it('returns successfully when comparing int', (): void => {
            const result = greaterThan(asIntExpression1, asIntExpression2);
            expect(result.toString()).to.equal(
                `asInt(tasks.A.outputs.parameters.output1) > asInt(tasks.B.outputs.parameters.output2)`,
            );
        });

        it('returns successfully when comparing float', (): void => {
            const result = greaterThan(asFloatExpression1, asFloatExpression2);
            expect(result.toString()).to.equal(
                `asFloat(tasks.A.outputs.parameters.output1) > asFloat(tasks.B.outputs.parameters.output2)`,
            );
        });
    });

    describe('lessThan', (): void => {
        it('returns successfully when comparing int', (): void => {
            const result = lessThan(asIntExpression1, asIntExpression2);
            expect(result.toString()).to.equal(
                `asInt(tasks.A.outputs.parameters.output1) < asInt(tasks.B.outputs.parameters.output2)`,
            );
        });

        it('returns successfully when comparing float', (): void => {
            const result = lessThan(asFloatExpression1, asFloatExpression2);
            expect(result.toString()).to.equal(
                `asFloat(tasks.A.outputs.parameters.output1) < asFloat(tasks.B.outputs.parameters.output2)`,
            );
        });
    });

    describe('greaterThanOrEqual', (): void => {
        it('returns successfully when comparing int', (): void => {
            const result = greaterThanOrEqual(asIntExpression1, asIntExpression2);
            expect(result.toString()).to.equal(
                `asInt(tasks.A.outputs.parameters.output1) >= asInt(tasks.B.outputs.parameters.output2)`,
            );
        });

        it('returns successfully when comparing float', (): void => {
            const result = greaterThanOrEqual(asFloatExpression1, asFloatExpression2);
            expect(result.toString()).to.equal(
                `asFloat(tasks.A.outputs.parameters.output1) >= asFloat(tasks.B.outputs.parameters.output2)`,
            );
        });
    });

    describe('lessThanOrEqual', (): void => {
        it('returns successfully when comparing int', (): void => {
            const result = lessThanOrEqual(asIntExpression1, asIntExpression2);
            expect(result.toString()).to.equal(
                `asInt(tasks.A.outputs.parameters.output1) <= asInt(tasks.B.outputs.parameters.output2)`,
            );
        });

        it('returns successfully when comparing float', (): void => {
            const result = lessThanOrEqual(asFloatExpression1, asFloatExpression2);
            expect(result.toString()).to.equal(
                `asFloat(tasks.A.outputs.parameters.output1) <= asFloat(tasks.B.outputs.parameters.output2)`,
            );
        });
    });
});
