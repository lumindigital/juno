import { DagTask } from '../dag-task.js';
import { getVariableReference, TaskAndResult } from '../expression.js';
import { WorkflowStep } from '../workflow-step.js';
import {
    ComparisonExpression,
    HyphenatedExpressionArgs,
    LogicalExpression,
    ParenExpression,
    SimpleTemplateTag,
} from './interfaces.js';

export type LogicalExpressionInputs =
    | SimpleTemplateTag
    | HyphenatedExpressionArgs
    | ComparisonExpression
    | LogicalExpression
    | ParenExpression
    | DagTask
    | WorkflowStep
    | TaskAndResult;

export function and(inputs: LogicalExpressionInputs[]): LogicalExpression {
    let result = '';

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        let output: string;

        if (input && (input as DagTask)?.isDagTask) {
            output = (input as DagTask).name;
        } else if (input && (input as WorkflowStep)?.isWorkflowStep) {
            output = (input as WorkflowStep).name;
        } else if (input && (input as TaskAndResult)?.task) {
            output = getVariableReference(input as TaskAndResult);
        } else {
            output = (input as LogicalExpression).output;
        }

        if (i < inputs.length - 1) {
            output += ' && ';
        }
        result += output;
    }
    return { output: result, isLogicalExpression: true };
}

export function or(inputs: LogicalExpressionInputs[]): LogicalExpression {
    let result = '';

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        let output: string;

        if (input && (input as DagTask)?.isDagTask) {
            output = (input as DagTask).name;
        } else if (input && (input as WorkflowStep)?.isWorkflowStep) {
            output = (input as WorkflowStep).name;
        } else if (input && (input as TaskAndResult)?.task) {
            output = getVariableReference(input as TaskAndResult);
        } else {
            output = (input as LogicalExpression).output;
        }

        if (i < inputs.length - 1) {
            output += ' || ';
        }
        result += output;
    }
    return { output: result, isLogicalExpression: true };
}

export function not(input: LogicalExpressionInputs): LogicalExpression {
    if (input && (input as ParenExpression)?.isParenExpression) {
        return {
            output: `!${(input as ParenExpression).output}`,
            isLogicalExpression: true,
        };
    }

    return {
        output: `!${paren(input as LogicalExpression).output}`,
        isLogicalExpression: true,
    };
}

export function paren(input: LogicalExpression): ParenExpression {
    return {
        output: `( ${input.output} )`,
        isParenExpression: true,
    };
}
