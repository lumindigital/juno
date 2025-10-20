import {
    IoArgoprojWorkflowV1Alpha1Workflow,
    IoK8SApimachineryPkgApisMetaV1ObjectMeta,
} from '../workflow-interfaces/data-contracts.js';
import { WorkflowSpec } from './workflow-spec.js';

export class Workflow {
    public apiVersion?: string;

    public metadata!: IoK8SApimachineryPkgApisMetaV1ObjectMeta;
    public spec!: WorkflowSpec;
    constructor(init?: Partial<Workflow>) {
        Object.assign(this, init);
    }

    toWorkflow(): IoArgoprojWorkflowV1Alpha1Workflow {
        if (!this.metadata || !this.spec) {
            throw new Error('metadata and spec are required');
        }

        return {
            apiVersion: this.apiVersion ?? 'argoproj.io/v1alpha1',
            kind: 'Workflow',
            metadata: this.metadata,
            spec: this.spec.toWorkflowSpec(),
        };
    }
}
