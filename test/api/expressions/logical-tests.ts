import { expect } from 'chai';
import { and, not, or, paren } from '../../../src/api/expressions/logical';
import { DagTask } from '../../../src/api/dag-task';
import { TaskResult } from '../../../src/api/expression';
import { WorkflowStep } from '../../../src/api/workflow-step';

describe('logical tests', (): void => {
    const dagTask = new DagTask('B', {});
    const dagTaskResult = { task: dagTask, result: TaskResult.Succeeded };
    const workflowStep = new WorkflowStep('C', {});
    const workflowStepResult = { task: workflowStep, result: TaskResult.Succeeded };

    describe('and', (): void => {
        it('returns successfully', (): void => {
            const result = and([
                { output: 'A', isLogicalExpression: true },
                dagTask,
                dagTaskResult,
                workflowStep,
                workflowStepResult,
            ]);
            expect(result.output).to.equal('A && B && B.Succeeded && C && C.Succeeded');
        });
    });

    describe('or', (): void => {
        it('returns successfully', (): void => {
            const result = or([
                { output: 'A', isLogicalExpression: true },
                dagTask,
                dagTaskResult,
                workflowStep,
                workflowStepResult,
            ]);
            expect(result.output).to.equal('A || B || B.Succeeded || C || C.Succeeded');
        });
    });

    describe('not', (): void => {
        it('returns successfully when not a paren', (): void => {
            const result = not({ output: 'A && B', isLogicalExpression: true });
            expect(result.output).to.equal('!( A && B )');
        });

        it('returns successfully when input is a paren', (): void => {
            const result = not({ output: '( A && B )', isParenExpression: true });
            expect(result.output).to.equal('!( A && B )');
        });
    });

    describe('paren', (): void => {
        it('returns successfully', (): void => {
            const result = paren({ output: 'A || B', isLogicalExpression: true });
            expect(result.output).to.equal('( A || B )');
        });
    });
});
