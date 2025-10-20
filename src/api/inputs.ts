import { IoArgoprojWorkflowV1Alpha1Inputs } from '../workflow-interfaces/data-contracts.js';
import { InputArtifact } from './artifact.js';
import { InputParameter } from './parameter.js';

export class Inputs {
    artifacts?: InputArtifact[];
    parameters?: InputParameter[];

    constructor(init?: Partial<Inputs>) {
        Object.assign(this, init);
    }

    toInputs(): IoArgoprojWorkflowV1Alpha1Inputs {
        return {
            artifacts: this.artifacts?.map((x) => x.toArtifact()),
            parameters: this.parameters?.map((x) => x.toParameter()),
        };
    }
}
