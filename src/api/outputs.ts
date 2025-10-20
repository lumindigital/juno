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

    toOutputs(): IoArgoprojWorkflowV1Alpha1Outputs {
        return {
            artifacts: this.artifacts?.map((x) => x.toArtifact()),
            exitCode: this.exitCode?.toString(),
            parameters: this.parameters?.map((x) => x.toParameter()),
            result: this.result,
        };
    }
}
