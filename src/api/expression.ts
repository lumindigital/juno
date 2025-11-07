import { InputArtifact, OutputArtifact, OutputResult } from './artifact.js';
import { DagTask } from './dag-task.js';
import { FromItemProperty, InputParameter, OutputParameter, WorkflowParameter } from './parameter.js';
import { WorkflowStep } from './workflow-step.js';

type OutputType = OutputArtifact | OutputParameter | OutputResult;
type InputType = InputParameter | InputArtifact | WorkflowParameter;
export type ExpressionArgs =
    | DagTask
    | WorkflowStep
    | TaskAndResult
    | TaskOutput
    | StepOutput
    | InputType
    | PathType
    | WorkflowOutput
    | FromItemProperty
    | OutputParameter;
export type TaskAndResult = { task: DagTask | WorkflowStep; result?: TaskResult };
export type TaskOutput = { dagTask: DagTask; output: OutputType };
export type StepOutput = { workflowStep: WorkflowStep; output: OutputType };
export type PathType = { pathResult: InputArtifact | OutputArtifact | OutputParameter };
export type WorkflowOutput = { workflowOutput: OutputArtifact | OutputParameter };

enum ExpressionType {
    DagTask = 'DagTask',
    WorkflowStep = 'WorkflowStep',
    TaskAndResult = 'TaskAndResult',
    InputParameter = 'InputParameter',
    InputArtifact = 'InputArtifact',
    StepOutputResult = 'StepOutputResult',
    StepOutputParameter = 'StepOutputParameter',
    StepOutputArtifact = 'StepOutputArtifact',
    TaskOutputResult = 'TaskOutputResult',
    TaskOutputParameter = 'TaskOutputParameter',
    TaskOutputArtifact = 'TaskOutputArtifact',
    InputArtifactPath = 'InputArtifactPath',
    OutputArtifactPath = 'OutputArtifactPath',
    OutputParameterPath = 'OutputParameterPath',
    WorkflowParameter = 'WorkflowParameter',
    WorkflowOutputParameter = 'WorkflowOutputParameter',
    WorkflowOutputArtifact = 'WorkflowOutputArtifact',
    FromItemProperty = 'FromItemProperty',
    OutputParameter = 'OutputParameter',
}

export enum TaskResult {
    Succeeded = 'Succeeded',
    Failed = 'Failed',
    Errored = 'Errored',
    Skipped = 'Skipped',
    Omitted = 'Omitted',
    Daemoned = 'Daemoned',
}

/**
 * Adds a logical AND between multiple expressions.
 *
 * @param input - A valid {@link ExpressionArgs} object
 *
 * @returns A string representation of the AND expression
 * @public
 */
export function and(inputs: (string | ExpressionArgs)[]): string {
    let result = '';

    for (let i = 0; i < inputs.length; i++) {
        if (i !== 0) {
            result += ' && ';
        }

        const input = inputs[i];

        result += getVariableReference(input);
    }

    return result;
}

/**
 * Adds a logical OR between multiple expressions.
 *
 * @param input - A valid {@link ExpressionArgs} object
 *
 * @returns A string representation of the OR expression
 * @public
 */
export function or(inputs: (string | ExpressionArgs)[]): string {
    let result = '';

    for (let i = 0; i < inputs.length; i++) {
        if (i !== 0) {
            result += ' || ';
        }

        const input = inputs[i];

        result += getVariableReference(input);
    }

    return result;
}

/**
 * Adds a logical NOT to an expression.
 *
 * @param input - A valid {@link ExpressionArgs} object
 *
 * @returns A string representation of the negated expression
 * @public
 */
export function not(input: string | ExpressionArgs): string {
    return `!${getVariableReference(input)}`;
}

/**
 * Wraps an expression in parentheses.
 *
 * @param input - A valid expression string
 *
 * @returns A string wrapped in parentheses
 * @public
 */
export function paren(input: string): string {
    return `( ${input} )`;
}

/**
 * Takes a string an wraps it in expression tags.
 *
 * @param input - A valid argoworkflow expression string
 *
 * @returns A string wrapped in expression tags {{=string}}.  Note: this does not handle hypenated parameters. Wrap any hyphenated parameters using {@link hyphenParameter} for that.
 * @public
 */
export function expressionTag(input: string): string {
    return `{{=${input}}}`;
}

/**
 * Takes a {@link ExpressionArgs} and converts it to a string that works with expressions
 *
 * @param input - A valid {@link ExpressionArgs} object
 *
 * @returns A string representation of the parameter argument. Any hyphenated parameters will be converted to the bracket notation.
 * @public
 */
export function hyphenParameter(input: ExpressionArgs): string {
    return hyphen(getVariableReference(input));
}

/**
 * Takes a {@link ExpressionArgs} or string and wraps it in simple expression tags.
 * @param input - A valid {@link ExpressionArgs} or string
 *
 * @returns A string wrapped in expression tags
 * @public
 */
export function simpleTag(input: ExpressionArgs | string): string {
    return `{{${getVariableReference(input)}}}`;
}

export function getVariableReference(expressionArgs: ExpressionArgs | string): string {
    if (typeof expressionArgs === 'string') {
        return expressionArgs;
    }

    const expressionType = getExpressionType(expressionArgs);

    switch (expressionType) {
        case ExpressionType.DagTask:
        case ExpressionType.WorkflowStep: {
            const task = expressionArgs as DagTask | WorkflowStep;
            return task.name;
        }
        case ExpressionType.TaskAndResult: {
            const taskAndResult = expressionArgs as TaskAndResult;

            if (taskAndResult.result) {
                return `${taskAndResult.task.name}.${taskAndResult.result}`;
            }

            return taskAndResult.task.name;
        }
        case ExpressionType.InputParameter: {
            const inputParameter = expressionArgs as InputParameter;
            return `inputs.parameters.${inputParameter.name}`;
        }
        case ExpressionType.InputArtifact: {
            const inputArtifact = expressionArgs as InputArtifact;
            return `inputs.artifacts.${inputArtifact.name}`;
        }
        case ExpressionType.StepOutputResult: {
            const stepOutputResult = expressionArgs as StepOutput;
            return `steps.${stepOutputResult.workflowStep.name}.outputs.result`;
        }
        case ExpressionType.StepOutputParameter: {
            const stepOutputParameter = expressionArgs as StepOutput;
            const stepOutputOutputParameter = stepOutputParameter.output as OutputParameter;
            return `steps.${stepOutputParameter.workflowStep.name}.outputs.parameters.${stepOutputOutputParameter.name}`;
        }
        case ExpressionType.StepOutputArtifact: {
            const stepOutputArtifact = expressionArgs as StepOutput;
            const stepOutputArtifactOutputArtifact = stepOutputArtifact.output as OutputArtifact;
            return `steps.${stepOutputArtifact.workflowStep.name}.outputs.artifacts.${stepOutputArtifactOutputArtifact.name}`;
        }
        case ExpressionType.TaskOutputResult: {
            const taskOutputResult = expressionArgs as TaskOutput;
            return `tasks.${taskOutputResult.dagTask.name}.outputs.result`;
        }
        case ExpressionType.TaskOutputParameter: {
            const taskOutputParameter = expressionArgs as TaskOutput;
            const taskOutputOutputParam = taskOutputParameter.output as OutputParameter;
            return `tasks.${taskOutputParameter.dagTask.name}.outputs.parameters.${taskOutputOutputParam.name}`;
        }
        case ExpressionType.TaskOutputArtifact: {
            const taskOutputArtifact = expressionArgs as TaskOutput;
            const taskOutputArtifactOutputArtifact = taskOutputArtifact.output as OutputArtifact;
            return `tasks.${taskOutputArtifact.dagTask.name}.outputs.artifacts.${taskOutputArtifactOutputArtifact.name}`;
        }
        case ExpressionType.InputArtifactPath: {
            const inputArtifactPath = expressionArgs as PathType;
            const inputArtifactPathResult = inputArtifactPath.pathResult as InputArtifact;
            return `inputs.artifacts.${inputArtifactPathResult.name}.path`;
        }
        case ExpressionType.OutputArtifactPath: {
            const outputArtifactPath = expressionArgs as PathType;
            const outputArtifactPathResult = outputArtifactPath.pathResult as OutputArtifact;
            return `outputs.artifacts.${outputArtifactPathResult.name}.path`;
        }
        case ExpressionType.OutputParameterPath: {
            const outputParameterPath = expressionArgs as PathType;
            const outputParameterPathResult = outputParameterPath.pathResult as OutputParameter;
            return `outputs.parameters.${outputParameterPathResult.name}.path`;
        }
        case ExpressionType.WorkflowParameter: {
            const workflowParameter = expressionArgs as WorkflowParameter;
            return `workflow.parameters.${workflowParameter.name}`;
        }
        case ExpressionType.WorkflowOutputParameter: {
            const workflowOutputParameter = expressionArgs as WorkflowOutput;
            const workflowOutputOutputParameter = workflowOutputParameter.workflowOutput as OutputParameter;
            return `workflow.outputs.parameters.${workflowOutputOutputParameter.name}`;
        }
        case ExpressionType.WorkflowOutputArtifact: {
            const workflowOutputArtifact = expressionArgs as WorkflowOutput;
            const workflowOutputOutputArtifact = workflowOutputArtifact.workflowOutput as OutputArtifact;
            return `workflow.outputs.artifacts.${workflowOutputOutputArtifact.name}`;
        }
        case ExpressionType.FromItemProperty: {
            const fromItem = expressionArgs as FromItemProperty;
            if (fromItem.itemKey) {
                return `item.${fromItem.itemKey}`;
            }
            return 'item';
        }
        case ExpressionType.OutputParameter: {
            const outputParameter = expressionArgs as OutputParameter;
            return `outputs.parameters.${outputParameter.name}`;
        }
        default: {
            throw new Error('Unsupported expression args');
        }
    }
}

function hyphen(input: string): string {
    const split = input.split('.');
    let output = split[0];

    for (let i = 1; i < split.length; i++) {
        if (split[i].includes('[')) {
            output = output.concat(`.${split[i]}`);
            continue;
        }

        if (split[i].includes('-')) {
            output = output.concat(`['${split[i]}']`);
            continue;
        }
        output = output.concat(`.${split[i]}`);
    }

    return output;
}

function getExpressionType(expressionArgs: ExpressionArgs): ExpressionType {
    if ((expressionArgs as TaskAndResult).task !== undefined && (expressionArgs as TaskAndResult)) {
        return ExpressionType.TaskAndResult;
    }

    if ((expressionArgs as DagTask).isDagTask !== undefined) {
        return ExpressionType.DagTask;
    }

    if ((expressionArgs as WorkflowStep).isWorkflowStep !== undefined) {
        return ExpressionType.WorkflowStep;
    }

    if ((expressionArgs as InputParameter).isInputParameter) {
        return ExpressionType.InputParameter;
    }

    if ((expressionArgs as InputArtifact).isInputArtifact) {
        return ExpressionType.InputArtifact;
    }

    if ((expressionArgs as TaskOutput).dagTask !== undefined && (expressionArgs as TaskOutput).output !== undefined) {
        const taskOutput = expressionArgs as TaskOutput;
        if ((taskOutput.output as OutputParameter).isOutputParameter) {
            return ExpressionType.TaskOutputParameter;
        }

        if ((taskOutput.output as OutputArtifact).isOutputArtifact) {
            return ExpressionType.TaskOutputArtifact;
        }

        if ((taskOutput.output as OutputResult).isOutputResult) {
            return ExpressionType.TaskOutputResult;
        }

        throw new Error(`Task ${taskOutput?.dagTask?.name} Unsupported task output`);
    }

    if (
        (expressionArgs as StepOutput).workflowStep !== undefined &&
        (expressionArgs as StepOutput).output !== undefined
    ) {
        const stepOutput = expressionArgs as StepOutput;
        if ((stepOutput.output as OutputParameter).isOutputParameter) {
            return ExpressionType.StepOutputParameter;
        }

        if ((stepOutput.output as OutputArtifact).isOutputArtifact) {
            return ExpressionType.StepOutputArtifact;
        }
        if ((stepOutput.output as OutputResult).isOutputResult) {
            return ExpressionType.StepOutputResult;
        }

        throw new Error(`Step ${stepOutput?.workflowStep?.name} Unsupported step output`);
    }

    if ((expressionArgs as PathType).pathResult !== undefined) {
        const pathExpression = expressionArgs as PathType;
        if ((pathExpression.pathResult as InputArtifact).isInputArtifact) {
            return ExpressionType.InputArtifactPath;
        }

        if ((pathExpression.pathResult as OutputArtifact).isOutputArtifact) {
            return ExpressionType.OutputArtifactPath;
        }

        if ((pathExpression.pathResult as OutputParameter).isOutputParameter) {
            return ExpressionType.OutputParameterPath;
        }

        throw new Error('Unsupported path expression result type');
    }

    if ((expressionArgs as WorkflowParameter).isWorkflowParameter) {
        return ExpressionType.WorkflowParameter;
    }

    if ((expressionArgs as WorkflowOutput).workflowOutput !== undefined) {
        const workflowOutput = expressionArgs as WorkflowOutput;
        if ((workflowOutput.workflowOutput as OutputParameter).isOutputParameter) {
            return ExpressionType.WorkflowOutputParameter;
        }

        if ((workflowOutput.workflowOutput as OutputArtifact).isOutputArtifact) {
            return ExpressionType.WorkflowOutputArtifact;
        }

        throw new Error('Unsupported workflow output type');
    }

    if ((expressionArgs as FromItemProperty).isFromItemProperty !== undefined) {
        return ExpressionType.FromItemProperty;
    }

    if ((expressionArgs as OutputParameter).isOutputParameter) {
        return ExpressionType.OutputParameter;
    }

    throw new Error('Unsupported expression args');
}
