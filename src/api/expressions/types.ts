import { OutputArtifact, OutputResult, InputArtifact } from '../artifact.js';
import { DagTask } from '../dag-task.js';
import { OutputParameter, InputParameter, WorkflowParameter, FromItemProperty } from '../parameter.js';
import { WorkflowStep } from '../workflow-step.js';

export type OutputType = OutputArtifact | OutputParameter | OutputResult | string;
export type InputType = InputParameter | InputArtifact | WorkflowParameter;
export type TaskAndResult = { task: DagTask | WorkflowStep; result: TaskResult };
export type TaskOutput = { dagTask: DagTask; output: OutputType };
export type TaskOutputParameters = { dagTaskOutputParameter: DagTask };
export type StringTaskOutput = { dagTaskName: string; output: OutputType };
export type StepOutput = { workflowStep: WorkflowStep; output: OutputType };
export type StepOutputParameters = { workflowStepOutputParameter: WorkflowStep };
export type StringStepOutput = { workflowStepName: string; output: OutputType };
export type PathType = { pathResult: InputArtifact | OutputArtifact | OutputParameter };
export type WorkflowOutput = { workflowOutput: OutputArtifact | OutputParameter | OutputResult };

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
    | OutputParameter
    | StringTaskOutput
    | StringStepOutput
    | TaskOutputParameters
    | StepOutputParameters;

export enum TaskResult {
    Succeeded = 'Succeeded',
    Failed = 'Failed',
    Errored = 'Errored',
    Skipped = 'Skipped',
    Omitted = 'Omitted',
    Daemoned = 'Daemoned',
}
