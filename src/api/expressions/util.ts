import { InputArtifact, OutputArtifact, OutputResult } from '../artifact.js';
import { DagTask } from '../dag-task.js';
import { InputParameter, OutputParameter, WorkflowParameter, FromItemProperty } from '../parameter.js';
import { WorkflowStep } from '../workflow-step.js';
import {
    ExpressionArgs,
    PathType,
    StepOutput,
    StepOutputParameters,
    StringStepOutput,
    StringTaskOutput,
    TaskAndResult,
    TaskOutput,
    TaskOutputParameters,
    WorkflowOutput,
} from './types.js';

enum ExpressionType {
    DagTask = 'DagTask',
    WorkflowStep = 'WorkflowStep',
    TaskAndResult = 'TaskAndResult',
    InputParameter = 'InputParameter',
    InputArtifact = 'InputArtifact',
    StepOutputResult = 'StepOutputResult',
    StepOutputParameter = 'StepOutputParameter',
    StepOutputArtifact = 'StepOutputArtifact',
    StepOutputString = 'StepOutputString',
    TaskOutputResult = 'TaskOutputResult',
    TaskOutputParameter = 'TaskOutputParameter',
    TaskOutputArtifact = 'TaskOutputArtifact',
    TaskOutputString = 'TaskOutputString',
    InputArtifactPath = 'InputArtifactPath',
    OutputArtifactPath = 'OutputArtifactPath',
    OutputParameterPath = 'OutputParameterPath',
    WorkflowParameter = 'WorkflowParameter',
    WorkflowOutputParameter = 'WorkflowOutputParameter',
    WorkflowOutputArtifact = 'WorkflowOutputArtifact',
    FromItemProperty = 'FromItemProperty',
    OutputParameter = 'OutputParameter',
    StringStepOutputResult = 'StringStepOutputResult',
    StringStepOutputParameter = 'StringStepOutputParameter',
    StringStepOutputArtifact = 'StringStepOutputArtifact',
    StringStepOutputString = 'StringStepOutputString',
    StringTaskOutputResult = 'StringTaskOutputResult',
    StringTaskOutputParameter = 'StringTaskOutputParameter',
    StringTaskOutputArtifact = 'StringTaskOutputArtifact',
    StringTaskOutputString = 'StringTaskOutputString',
    TaskOutputParameters = 'TaskOutputParameters',
    StepOutputParameters = 'StepOutputParameters',
}

export function getVariableReference(expressionArgs: ExpressionArgs): string {
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
        case ExpressionType.StepOutputString: {
            const stepOutputString = expressionArgs as StepOutput;
            const stepOutputStringOutput = stepOutputString.output as string;
            return `steps.${stepOutputString.workflowStep.name}.${stepOutputStringOutput}`;
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
        case ExpressionType.TaskOutputString: {
            const taskOutputString = expressionArgs as TaskOutput;
            const taskOutputStringOutput = taskOutputString.output as string;
            return `tasks.${taskOutputString.dagTask.name}.${taskOutputStringOutput}`;
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
            return `workflow.outputs.parameters.${workflowOutputOutputParameter.globalName}`;
        }
        case ExpressionType.WorkflowOutputArtifact: {
            const workflowOutputArtifact = expressionArgs as WorkflowOutput;
            const workflowOutputOutputArtifact = workflowOutputArtifact.workflowOutput as OutputArtifact;
            return `workflow.outputs.artifacts.${workflowOutputOutputArtifact.globalName}`;
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
        case ExpressionType.StringStepOutputResult: {
            const stringStepOutputResult = expressionArgs as StringStepOutput;
            return `steps.${stringStepOutputResult.workflowStepName}.outputs.result`;
        }
        case ExpressionType.StringStepOutputParameter: {
            const stringStepOutputParameter = expressionArgs as StringStepOutput;
            const stringStepOutputOutputParameter = stringStepOutputParameter.output as OutputParameter;
            return `steps.${stringStepOutputParameter.workflowStepName}.outputs.parameters.${stringStepOutputOutputParameter.name}`;
        }
        case ExpressionType.StringStepOutputArtifact: {
            const stringStepOutputArtifact = expressionArgs as StringStepOutput;
            const stringStepOutputArtifactOutputArtifact = stringStepOutputArtifact.output as OutputArtifact;
            return `steps.${stringStepOutputArtifact.workflowStepName}.outputs.artifacts.${stringStepOutputArtifactOutputArtifact.name}`;
        }
        case ExpressionType.StringStepOutputString: {
            const stringStepOutputString = expressionArgs as StringStepOutput;
            const stringStepOutputStringOutput = stringStepOutputString.output as string;
            return `steps.${stringStepOutputString.workflowStepName}.${stringStepOutputStringOutput}`;
        }
        case ExpressionType.StringTaskOutputResult: {
            const stringTaskOutputResult = expressionArgs as StringTaskOutput;
            return `tasks.${stringTaskOutputResult.dagTaskName}.outputs.result`;
        }
        case ExpressionType.StringTaskOutputParameter: {
            const stringTaskOutputParameter = expressionArgs as StringTaskOutput;
            const stringTaskOutputOutputParam = stringTaskOutputParameter.output as OutputParameter;
            return `tasks.${stringTaskOutputParameter.dagTaskName}.outputs.parameters.${stringTaskOutputOutputParam.name}`;
        }
        case ExpressionType.StringTaskOutputArtifact: {
            const stringTaskOutputArtifact = expressionArgs as StringTaskOutput;
            const stringTaskOutputArtifactOutputArtifact = stringTaskOutputArtifact.output as OutputArtifact;
            return `tasks.${stringTaskOutputArtifact.dagTaskName}.outputs.artifacts.${stringTaskOutputArtifactOutputArtifact.name}`;
        }
        case ExpressionType.StringTaskOutputString: {
            const stringTaskOutputString = expressionArgs as StringTaskOutput;
            const stringTaskOutputStringOutput = stringTaskOutputString.output as string;
            return `tasks.${stringTaskOutputString.dagTaskName}.${stringTaskOutputStringOutput}`;
        }

        case ExpressionType.TaskOutputParameters: {
            const taskOutputParameters = expressionArgs as TaskOutputParameters;
            return `tasks.${taskOutputParameters.dagTaskOutputParameter.name}.outputs.parameters`;
        }

        case ExpressionType.StepOutputParameters: {
            const stepOutputParameters = expressionArgs as StepOutputParameters;
            return `steps.${stepOutputParameters.workflowStepOutputParameter.name}.outputs.parameters`;
        }

        default: {
            throw new Error(`Unsupported expression args ${expressionType}`);
        }
    }
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

        if (typeof taskOutput.output === 'string') {
            return ExpressionType.TaskOutputString;
        }

        throw new Error(`Task ${taskOutput?.dagTask?.name} Unsupported task output`);
    }

    if ((expressionArgs as TaskOutputParameters).dagTaskOutputParameter !== undefined) {
        return ExpressionType.TaskOutputParameters;
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

        if (typeof stepOutput.output === 'string') {
            return ExpressionType.StepOutputString;
        }

        throw new Error(`Step ${stepOutput?.workflowStep?.name} Unsupported step output`);
    }

    if ((expressionArgs as StepOutputParameters).workflowStepOutputParameter !== undefined) {
        return ExpressionType.StepOutputParameters;
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

    if ((expressionArgs as StringTaskOutput).dagTaskName !== undefined) {
        const stringTaskOutput = expressionArgs as StringTaskOutput;

        if ((stringTaskOutput.output as OutputResult).isOutputResult) {
            return ExpressionType.StringTaskOutputResult;
        }

        if ((stringTaskOutput.output as OutputParameter).isOutputParameter) {
            return ExpressionType.StringTaskOutputParameter;
        }

        if ((stringTaskOutput.output as OutputArtifact).isOutputArtifact) {
            return ExpressionType.StringTaskOutputArtifact;
        }

        if (typeof stringTaskOutput.output === 'string') {
            return ExpressionType.StringTaskOutputString;
        }

        throw new Error(`Task ${stringTaskOutput?.dagTaskName} Unsupported string task output`);
    }

    if ((expressionArgs as StringStepOutput).workflowStepName !== undefined) {
        const stringTaskOutput = expressionArgs as StringTaskOutput;

        if ((stringTaskOutput.output as OutputResult).isOutputResult) {
            return ExpressionType.StringStepOutputResult;
        }

        if ((stringTaskOutput.output as OutputParameter).isOutputParameter) {
            return ExpressionType.StringStepOutputParameter;
        }

        if ((stringTaskOutput.output as OutputArtifact).isOutputArtifact) {
            return ExpressionType.StringStepOutputArtifact;
        }

        if (typeof stringTaskOutput.output === 'string') {
            return ExpressionType.StringStepOutputString;
        }

        throw new Error(`Task ${stringTaskOutput?.dagTaskName} Unsupported string task output`);
    }

    throw new Error('Unsupported expression args');
}
