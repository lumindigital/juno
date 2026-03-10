import { expect } from 'chai';
import { and, not, or, paren } from '../../../src/api/expressions/logical';
import { DagTask } from '../../../src/api/dag-task';
import { WorkflowStep } from '../../../src/api/workflow-step';
import { LogicalExpression, ParenExpression } from '../../../src/api/expressions/classes';
import { TaskResult } from '../../../src/api/expressions/types';
import { contains, startsWith } from '../../../src/api/expressions/string-operator';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('logical tests', (): void => {
    const dagTask = new DagTask('B', {});
    const dagTaskResult = { dagTaskResult: dagTask, result: TaskResult.Succeeded };
    const workflowStep = new WorkflowStep('C', {});
    const hyphenatedExpressionArgs = hyphenateExpressionArgs({
        dagTask: new DagTask('A-1', {}),
        output: new OutputParameter('output-1'),
    });
    const containsExpr = contains(hyphenatedExpressionArgs, 'search');
    const startsWithExpr = startsWith(hyphenatedExpressionArgs, 'prefix');

    describe('and', (): void => {
        it('returns successfully', (): void => {
            const result = and([new LogicalExpression('A'), dagTask, dagTaskResult, workflowStep]);
            expect(result.toString()).to.equal('A && B && B.Succeeded && C');
        });

        it('returns successfully with string operator expressions', (): void => {
            const result = and([containsExpr, startsWithExpr]);
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] contains 'search' && tasks['A-1'].outputs.parameters['output-1'] startsWith 'prefix'`,
            );
        });

        it('returns successfully with mixed inputs including string operator expressions', (): void => {
            const result = and([new LogicalExpression('A'), containsExpr, dagTask]);
            expect(result.toString()).to.equal(
                `A && tasks['A-1'].outputs.parameters['output-1'] contains 'search' && B`,
            );
        });
    });

    describe('or', (): void => {
        it('returns successfully', (): void => {
            const result = or([new LogicalExpression('A'), dagTask, dagTaskResult, workflowStep]);
            expect(result.toString()).to.equal('A || B || B.Succeeded || C');
        });

        it('returns successfully with string operator expressions', (): void => {
            const result = or([containsExpr, startsWithExpr]);
            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] contains 'search' || tasks['A-1'].outputs.parameters['output-1'] startsWith 'prefix'`,
            );
        });

        it('returns successfully with mixed inputs including string operator expressions', (): void => {
            const result = or([new LogicalExpression('A'), containsExpr, dagTask]);
            expect(result.toString()).to.equal(
                `A || tasks['A-1'].outputs.parameters['output-1'] contains 'search' || B`,
            );
        });
    });

    describe('not', (): void => {
        it('returns successfully when not a paren', (): void => {
            const result = not(new LogicalExpression('A && B'));
            expect(result.toString()).to.equal('!( A && B )');
        });

        it('returns successfully when input is a paren', (): void => {
            const result = not(new ParenExpression('( A && B )'));
            expect(result.toString()).to.equal('!( A && B )');
        });

        it('returns successfully with a string operator expression', (): void => {
            const result = not(containsExpr);
            expect(result.toString()).to.equal(`!( tasks['A-1'].outputs.parameters['output-1'] contains 'search' )`);
        });
    });

    describe('paren', (): void => {
        it('returns successfully', (): void => {
            const result = paren(new LogicalExpression('A || B'));
            expect(result.toString()).to.equal('( A || B )');
        });
    });
});
