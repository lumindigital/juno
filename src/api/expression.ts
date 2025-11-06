import { DagTask } from './dag-task.js';
import { FromItemProperty, InputParameter, OutputParameter, WorkflowParameter } from './parameter.js';
import { WorkflowStep } from './workflow-step.js';
import { InputArtifact, OutputArtifact, OutputResult } from './artifact.js';

type Task = DagTask | WorkflowStep;
export type TaskAndResult = { task: Task; result?: TaskResult };
export type ExpressionArgs = Task | TaskAndResult | string;
export type OutputParameterArgs = { parameter: OutputParameter | OutputArtifact | OutputResult; task?: Task | Self };
export type LocalInputArtifactArgs = { inputArtifact: InputArtifact; task?: Self };
export type WithParameterArgs = OutputParameterArgs;
type ParameterArgs =
    | InputParameter
    | InputArtifact
    | OutputParameterArgs
    | WorkflowParameter
    | FromItemProperty
    | LocalInputArtifactArgs;

enum InputType {
    InputParameter = 'InputParameter',
    InputArtifact = 'InputArtifact',
    WorkflowParameter = 'WorkflowParameter',
    OutputParameter = 'OutputParameter',
    OutputParameterSelf = 'OutputParameterSelf',
    OutputArtifact = 'OutputArtifact',
    OutputArtifactSelf = 'OutputArtifactSelf',
    OutputResult = 'OutputResult',
    FromItemProperty = 'FromItemProperty',
    InputArtifactSelf = 'LocalInputArtifactSelf',
}

export enum TaskResult {
    Succeeded = 'Succeeded',
    Failed = 'Failed',
    Errored = 'Errored',
    Skipped = 'Skipped',
    Omitted = 'Omitted',
    Daemoned = 'Daemoned',
}

export class Self {
    readonly isSelf = true;
    constructor() {}
}

export function and(inputs: ExpressionArgs[]): string {
    let result = '';

    for (let i = 0; i < inputs.length; i++) {
        if (i !== 0) {
            result += ' && ';
        }

        const input = inputs[i];

        result += getTaskValue(input);
    }

    return result;
}

export function or(inputs: ExpressionArgs[]): string {
    let result = '';

    for (let i = 0; i < inputs.length; i++) {
        if (i !== 0) {
            result += ' || ';
        }

        const input = inputs[i];

        result += getTaskValue(input);
    }

    return result;
}

export function not(input: ExpressionArgs): string {
    return `!${getTaskValue(input)}`;
}

export function paren(input: string): string {
    return `( ${input} )`;
}

export function simpleTag(input: ParameterArgs | string): string {
    return `{{${getVariable(input)}}}`;
}

export function expressionTag(input: string): string {
    return `{{=${input}}}`;
}

export function depends(input: ExpressionArgs): string {
    return getTaskValue(input);
}

export function hyphenParameter(input: ParameterArgs): string {
    return hyphen(getVariable(input));
}

export function containsTag(input: string): boolean {
    return input.includes('{{') && input.includes('}}');
}

function hyphen(input: string): string {
    const split = input.split('.');
    let output = split[0];

    for (let i = 1; i < split.length; i++) {
        if (split[i].includes('-')) {
            output = output.concat(`['${split[i]}']`);
            continue;
        }
        output = output.concat(`.${split[i]}`);
    }

    return output;
}

function getTaskValue(input: ExpressionArgs): string {
    if (typeof input === 'string') {
        return input;
    } else if (isTaskAndResult(input)) {
        return getTaskNameWithResult(input); //input.task.name;
    } else {
        return input.name;
    }
}

function getTaskNameWithResult(input: TaskAndResult): string {
    if (input.result) {
        return `${input.task.name}.${input.result}`;
    }

    return input.task.name;
}

function isTaskAndResult(input: ExpressionArgs): input is TaskAndResult {
    return (input as TaskAndResult).task !== undefined;
}

function isDagTask(input: Task): input is DagTask {
    return (input as DagTask).isDagTask;
}

function getInputType(input: ParameterArgs): InputType {
    if ((input as InputParameter).isInputParameter) {
        return InputType.InputParameter;
    }

    if ((input as InputArtifact).isInputArtifact) {
        return InputType.InputArtifact;
    }

    if (
        ((input as OutputParameterArgs).parameter as OutputParameter)?.isOutputParameter &&
        !((input as OutputParameterArgs)?.task as Self)?.isSelf
    ) {
        return InputType.OutputParameter;
    }

    if (
        ((input as OutputParameterArgs).parameter as OutputArtifact)?.isOutputArtifact &&
        !((input as OutputParameterArgs)?.task as Self)?.isSelf
    ) {
        return InputType.OutputArtifact;
    }

    if (((input as OutputParameterArgs).parameter as OutputResult)?.isOutputResult) {
        return InputType.OutputResult;
    }

    if (
        ((input as OutputParameterArgs).parameter as OutputParameter)?.isOutputParameter &&
        ((input as OutputParameterArgs)?.task as Self)?.isSelf
    ) {
        return InputType.OutputParameterSelf;
    }

    if (
        ((input as OutputParameterArgs).parameter as OutputArtifact)?.isOutputArtifact &&
        ((input as OutputParameterArgs)?.task as Self)?.isSelf
    ) {
        return InputType.OutputArtifactSelf;
    }

    // if (((input as OutputParameterArgs)?.parameter as OutputResult)?.isOutputResult) {

    //     throw new Error('Undefined self input type');
    // }

    if (((input as LocalInputArtifactArgs).inputArtifact as InputArtifact)?.isInputArtifact) {
        return InputType.InputArtifactSelf;
    }

    if ((input as FromItemProperty).isFromItemProperty) {
        return InputType.FromItemProperty;
    }

    if ((input as WorkflowParameter).isWorkflowParameter) {
        return InputType.WorkflowParameter;
    }

    throw new Error('Undefined input type');
}

function getVariable(input: ParameterArgs | string): string {
    if (typeof input === 'string') {
        return input;
    }

    const type = getInputType(input);

    switch (type) {
        case InputType.InputParameter: {
            return `inputs.parameters.${(input as InputParameter).name}`;
        }
        case InputType.InputArtifact: {
            return `inputs.artifacts.${(input as InputArtifact).name}`;
        }
        case InputType.OutputParameter: {
            const outputParameter = input as OutputParameterArgs;
            const parameter = outputParameter.parameter as OutputParameter;
            let adagOrStep = '';

            if (!outputParameter.task) {
                throw new Error(`Task or localPath=true required for output parameter ${parameter.name}`);
            }

            const task = outputParameter.task as Task;

            if (isDagTask(task)) {
                adagOrStep = 'tasks';
            } else {
                adagOrStep = 'steps';
            }

            return `${adagOrStep}.${task.name}.outputs.parameters.${parameter.name}`;
        }
        case InputType.OutputArtifact: {
            const outputArtifact = input as OutputParameterArgs;
            const parameter = outputArtifact.parameter as OutputArtifact;
            let pdagOrStep = '';

            const task = outputArtifact.task as Task;

            if (isDagTask(task)) {
                pdagOrStep = 'tasks';
            } else {
                pdagOrStep = 'steps';
            }

            return `${pdagOrStep}.${task.name}.outputs.artifacts.${parameter.name}`;
        }
        case InputType.OutputResult: {
            const outputResult = input as OutputParameterArgs;

            const task = outputResult.task as Task;

            let adagOrStep = '';
            if (isDagTask(task)) {
                adagOrStep = 'tasks';
            } else {
                adagOrStep = 'steps';
            }

            return `${adagOrStep}.${task.name}.outputs.result`;
        }
        case InputType.FromItemProperty: {
            const fromItem = input as FromItemProperty;
            if (fromItem.itemKey) {
                return `item.${fromItem.itemKey}`;
            }
            return 'item';
        }
        case InputType.WorkflowParameter: {
            return `workflow.parameters.${(input as WorkflowParameter).name}`;
        }
        case InputType.InputArtifactSelf: {
            return `inputs.artifacts.${(input as LocalInputArtifactArgs).inputArtifact.name}.path`;
        }
        case InputType.OutputArtifactSelf: {
            const outputArtifactArgs = input as OutputParameterArgs;
            const parameter = outputArtifactArgs.parameter as OutputArtifact;

            return `outputs.artifacts.${parameter.name}.path`;
        }
        case InputType.OutputParameterSelf: {
            const outputParameterArgs = input as OutputParameterArgs;
            const parameter = outputParameterArgs.parameter as OutputParameter;

            return `outputs.parameters.${parameter.name}.path`;
        }
    }
}
