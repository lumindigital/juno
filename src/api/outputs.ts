import { IoArgoprojWorkflowV1Alpha1Outputs } from '../workflow-interfaces/data-contracts.js';
import { OutputArtifact } from './artifact.js';
import { OutputParameter } from './parameter.js';

export class Outputs {
    artifacts?: OutputArtifact[];

    exitCode?: number;
    parameters?: OutputParameter[];
    result?: string;
    constructor(init?: Partial<Outputs>) {
        Object.assign(this, init);
    }

    toOutputs(templateName: string): IoArgoprojWorkflowV1Alpha1Outputs {
        return {
            artifacts: this.artifacts?.map((x) => x.toArtifact(templateName)),
            exitCode: this.exitCode?.toString(),
            parameters: this.parameters?.map((x) => x.toParameter(templateName)),
            result: this.result,
        };
    }
}
