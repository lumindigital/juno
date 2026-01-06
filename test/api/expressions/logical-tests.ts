import { expect } from 'chai';
import { and, not, or, paren } from '../../../src/api/expressions/logical';
import { DagTask } from '../../../src/api/dag-task';
import { TaskResult } from '../../../src/api/expression';
import { WorkflowStep } from '../../../src/api/workflow-step';
import { LogicalExpression, ParenExpression } from '../../../src/api/expressions/classes';

describe('logical tests', (): void => {
    const dagTask = new DagTask('B', {});
    const dagTaskResult = { task: dagTask, result: TaskResult.Succeeded };
    const workflowStep = new WorkflowStep('C', {});
    const workflowStepResult = { task: workflowStep, result: TaskResult.Succeeded };

    describe('and', (): void => {
        it('returns successfully', (): void => {
            const result = and([new LogicalExpression('A'), dagTask, dagTaskResult, workflowStep, workflowStepResult]);
            expect(result.toString()).to.equal('A && B && B.Succeeded && C && C.Succeeded');
        });
    });

    describe('or', (): void => {
        it('returns successfully', (): void => {
            const result = or([new LogicalExpression('A'), dagTask, dagTaskResult, workflowStep, workflowStepResult]);
            expect(result.toString()).to.equal('A || B || B.Succeeded || C || C.Succeeded');
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
    });

    describe('paren', (): void => {
        it('returns successfully', (): void => {
            const result = paren(new LogicalExpression('A || B'));
            expect(result.toString()).to.equal('( A || B )');
        });
    });
});
