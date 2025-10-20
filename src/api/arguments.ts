import { IoArgoprojWorkflowV1Alpha1Arguments } from '../workflow-interfaces/data-contracts.js';
import { ArgumentArtifact } from './artifact.js';
import { ArgumentParameter, WorkflowParameter } from './parameter.js';

export class WorkflowArguments {
    readonly workflowArgument = true;
    artifacts?: ArgumentArtifact[];
    parameters?: WorkflowParameter[];

    constructor(init?: Partial<WorkflowArguments>) {
        Object.assign(this, init);
    }

    toArguments(): IoArgoprojWorkflowV1Alpha1Arguments {
        return {
            artifacts: this.artifacts?.map((x) => x.toArtifact()),
            parameters: this.parameters?.map((x) => x.toParameter()),
        };
    }
}

export class Arguments {
    readonly argument = true;
    artifacts?: ArgumentArtifact[];
    parameters?: ArgumentParameter[];

    constructor(init?: Partial<Arguments>) {
        Object.assign(this, init);
    }

    toArguments(): IoArgoprojWorkflowV1Alpha1Arguments {
        return {
            artifacts: this.artifacts?.map((x) => x.toArtifact()),
            parameters: this.parameters?.map((x) => x.toParameter()),
        };
    }
}
