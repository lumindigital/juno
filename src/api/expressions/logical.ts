import { DagTask } from '../dag-task.js';
import { WorkflowStep } from '../workflow-step.js';
import {
    ComparisonExpression,
    HyphenatedExpressionArgs,
    LogicalExpression,
    ParenExpression,
    SimpleTemplateTag,
    StringOperatorExpressions,
} from './classes.js';
import { TaskAndResult } from './types.js';
import { getVariableReference } from './util.js';

export type LogicalExpressionInputs =
    | SimpleTemplateTag
    | HyphenatedExpressionArgs
    | ComparisonExpression
    | LogicalExpression
    | ParenExpression
    | DagTask
    | WorkflowStep
    | TaskAndResult
    | StringOperatorExpressions;

export function and(inputs: LogicalExpressionInputs[]): LogicalExpression {
    let result = '';

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        let output: string;

        if (input && (input as DagTask)?.isDagTask) {
            output = (input as DagTask).name;
        } else if (input && (input as WorkflowStep)?.isWorkflowStep) {
            output = (input as WorkflowStep).name;
        } else if (input && (input as TaskAndResult)?.dagTaskResult) {
            output = getVariableReference(input as TaskAndResult);
        } else {
            output = (input as LogicalExpression).toString();
        }

        if (i < inputs.length - 1) {
            output += ' && ';
        }
        result += output;
    }
    return new LogicalExpression(result);
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
        } else if (input && (input as TaskAndResult)?.dagTaskResult) {
            output = getVariableReference(input as TaskAndResult);
        } else {
            output = (input as LogicalExpression).toString();
        }

        if (i < inputs.length - 1) {
            output += ' || ';
        }
        result += output;
    }
    return new LogicalExpression(result);
}

export function not(input: LogicalExpressionInputs): LogicalExpression {
    if (input && (input as ParenExpression)?.isParenExpression) {
        return new LogicalExpression(`!${(input as ParenExpression).toString()}`);
    }

    if (input && (input as DagTask)?.isDagTask) {
        return new LogicalExpression(`!( ${(input as DagTask).name} )`);
    }

    if (input && (input as WorkflowStep)?.isWorkflowStep) {
        return new LogicalExpression(`!( ${(input as WorkflowStep).name} )`);
    }

    if (input && (input as TaskAndResult)?.dagTaskResult) {
        return new LogicalExpression(`!( ${getVariableReference(input as TaskAndResult)} )`);
    }

    return new LogicalExpression(`!${paren(input as LogicalExpression).toString()}`);
}

export function paren(input: LogicalExpression): ParenExpression {
    return new ParenExpression(`( ${input.toString()} )`);
}
