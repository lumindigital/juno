import { expect } from 'chai';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import { LogicalExpression } from '../../../src/api/expressions/classes';
import { DagTask } from '../../../src/api/dag-task';
import { OutputParameter } from '../../../src/api/parameter';

describe('tag tests', (): void => {
    const logicalExpression = new LogicalExpression('A + B');
    const stringArg = { string: 'A' };

    describe('expressionTag', (): void => {
        it('returns successfully', (): void => {
            const result = expressionTag(logicalExpression);

            expect(result.toString()).to.equal('{{=A + B}}');
        });

        it('returns successfully with string interpolation', (): void => {
            const result = expressionTag(logicalExpression);

            expect(`${result}`).to.equal('{{=A + B}}');
        });
    });

    describe('simpleTag', (): void => {
        it('returns successfully', (): void => {
            const result = simpleTag(stringArg);

            expect(result.toString()).to.equal('{{A}}');
        });

        it('returns successfully with string interpolation', (): void => {
            const result = simpleTag(stringArg);

            expect(`${result}`).to.equal('{{A}}');
        });
    });

    describe('hyphenateExpressionArgs', (): void => {
        it('returns successfully when Expression Arg', (): void => {
            const result = hyphenateExpressionArgs({
                dagTask: new DagTask('A-1', {}),
                output: new OutputParameter('output-1'),
            });
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1']`);
        });

        it('returns successfully when Expression Arg with brackets', (): void => {
            const result = hyphenateExpressionArgs({
                dagTask: new DagTask("['A-1']", {}),
                output: new OutputParameter('output-1'),
            });
            expect(result.toString()).to.equal(`tasks['A-1'].outputs.parameters['output-1']`);
        });
    });
});
