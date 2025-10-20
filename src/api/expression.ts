import { DagTask } from './dag-task.js';
import { FromItemProperty, InputParameter, OutputParameter, WorkflowParameter } from './parameter.js';
import { WorkflowStep } from './workflow-step.js';
import { InputArtifact, OutputArtifact, OutputResult } from './artifact.js';

type Task = DagTask | WorkflowStep;
export type TaskAndResult = { task: Task; result?: TaskResult };
export type ExpressionArgs = Task | TaskAndResult | string;
export type OutputParameterArgs = { parameter: OutputParameter | OutputArtifact | OutputResult; task: Task };
export type WithParameterArgs = OutputParameterArgs;
type ParameterArgs = InputParameter | InputArtifact | OutputParameterArgs | WorkflowParameter | FromItemProperty;

enum InputType {
    InputParameter = 'InputParameter',
    InputArtifact = 'InputArtifact',
    WorkflowParameter = 'WorkflowParameter',
    OutputParameter = 'OutputParameter',
    OutputArtifact = 'OutputArtifact',
    OutputResult = 'OutputResult',
    FromItemProperty = 'FromItemProperty',
}

export enum TaskResult {
    Succeeded = 'Succeeded',
    Failed = 'Failed',
    Errored = 'Errored',
    Skipped = 'Skipped',
    Omitted = 'Omitted',
    Daemoned = 'Daemoned',
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
    return (input as DagTask).dagTask !== undefined;
}

function getInputType(input: ParameterArgs): InputType {
    if ((input as InputParameter).isInputParameter !== undefined) {
        return InputType.InputParameter;
    }

    if ((input as InputArtifact).isInputArtifact !== undefined) {
        return InputType.InputArtifact;
    }

    if (((input as OutputParameterArgs).parameter as OutputParameter)?.isOutputParameter !== undefined) {
        return InputType.OutputParameter;
    }

    if (((input as OutputParameterArgs).parameter as OutputArtifact)?.isOutputArtifact !== undefined) {
        return InputType.OutputArtifact;
    }

    if (((input as OutputParameterArgs).parameter as OutputResult)?.isOutputResult !== undefined) {
        return InputType.OutputResult;
    }

    if ((input as FromItemProperty).isFromItemProperty !== undefined) {
        return InputType.FromItemProperty;
    }

    if ((input as WorkflowParameter).isWorkflowParameter !== undefined) {
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
            if (isDagTask(outputParameter.task)) {
                adagOrStep = 'tasks';
            } else {
                adagOrStep = 'steps';
            }

            return `${adagOrStep}.${outputParameter.task.name}.outputs.parameters.${parameter.name}`;
        }
        case InputType.OutputArtifact: {
            const outputArtifact = input as OutputParameterArgs;
            const parameter = outputArtifact.parameter as OutputArtifact;
            let pdagOrStep = '';
            if (isDagTask(outputArtifact.task)) {
                pdagOrStep = 'tasks';
            } else {
                pdagOrStep = 'steps';
            }

            return `${pdagOrStep}.${outputArtifact.task.name}.outputs.artifacts.${parameter.name}`;
        }
        case InputType.OutputResult: {
            const outputResult = input as OutputParameterArgs;

            let adagOrStep = '';
            if (isDagTask(outputResult.task)) {
                adagOrStep = 'tasks';
            } else {
                adagOrStep = 'steps';
            }

            return `${adagOrStep}.${outputResult.task.name}.outputs.result`;
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
    }
}
