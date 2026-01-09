import { expect } from 'chai';
import { nilCoalescing, ternary } from '../../../src/api/expressions/conditional';
import { DagTask } from '../../../src/api/dag-task';
import { OutputParameter } from '../../../src/api/parameter';
import { hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import { equals } from '../../../src/api/expressions/comparison';

describe('conditional tests', (): void => {
    const expressionArg1 = { dagTask: new DagTask('A', {}), output: new OutputParameter('output1') };
    const expressionArg2 = { dagTask: new DagTask('B', {}), output: new OutputParameter('output2') };
    const hyphenatedExpressionArgs1 = hyphenateExpressionArgs({
        dagTask: new DagTask('A-1', {}),
        output: new OutputParameter('output-1'),
    });
    const hyphenatedExpressionArgs2 = hyphenateExpressionArgs({
        dagTask: new DagTask('B-1', {}),
        output: new OutputParameter('output-2'),
    });

    const simpleTemplateTag1 = simpleTag(expressionArg1);
    const simpleTemplateTag2 = simpleTag(expressionArg2);

    const comparison = equals(simpleTemplateTag1, simpleTemplateTag2);

    describe('ternary', (): void => {
        it('returns successfully when using strings for whenTrue and whenFalse', (): void => {
            const result = ternary(comparison, 'trueValue', 'falseValue');
            expect(result.toString()).to.equal(
                `{{tasks.A.outputs.parameters.output1}} == {{tasks.B.outputs.parameters.output2}} ? 'trueValue' : 'falseValue'`,
            );
        });

        it('returns successfully when using hyphenated tags for whenTrue and whenFalse', (): void => {
            const result = ternary(comparison, hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.toString()).to.equal(
                `{{tasks.A.outputs.parameters.output1}} == {{tasks.B.outputs.parameters.output2}} ? tasks['A-1'].outputs.parameters['output-1'] : tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when using ternary expressions for whenTrue and whenFalse', (): void => {
            const innerTernaryTrue = ternary(comparison, 'innerTrue', 'innerFalse');
            const innerTernaryFalse = ternary(comparison, 'innerTrue', 'innerFalse');
            const result = ternary(comparison, innerTernaryTrue, innerTernaryFalse);
            expect(result.toString()).to.equal(
                `{{tasks.A.outputs.parameters.output1}} == {{tasks.B.outputs.parameters.output2}} ? {{tasks.A.outputs.parameters.output1}} == {{tasks.B.outputs.parameters.output2}} ? 'innerTrue' : 'innerFalse' : {{tasks.A.outputs.parameters.output1}} == {{tasks.B.outputs.parameters.output2}} ? 'innerTrue' : 'innerFalse'`,
            );
        });
    });

    describe('nil coalescing', (): void => {
        it('returns successfully when using hyphenated expression args for condition and whenNil', (): void => {
            const result = nilCoalescing(hyphenatedExpressionArgs1, hyphenatedExpressionArgs2);
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] ?? tasks['B-1'].outputs.parameters['output-2']`,
            );
        });

        it('returns successfully when using hyphenated expression args for condition and string for whenNil', (): void => {
            const result = nilCoalescing(hyphenatedExpressionArgs1, 'defaultValue');
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1'] ?? 'defaultValue'`);
        });
    });
});
