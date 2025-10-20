import {
    IoArgoprojWorkflowV1Alpha1WorkflowTemplate,
    IoK8SApimachineryPkgApisMetaV1ObjectMeta,
} from '../workflow-interfaces/data-contracts.js';
import { WorkflowSpec } from './workflow-spec.js';

export class WorkflowTemplate {
    public apiVersion?: string;

    public metadata!: IoK8SApimachineryPkgApisMetaV1ObjectMeta;
    public spec!: WorkflowSpec;
    constructor(init?: Partial<WorkflowTemplate>) {
        Object.assign(this, init);
    }

    toWorkflowTemplate(): IoArgoprojWorkflowV1Alpha1WorkflowTemplate {
        return {
            apiVersion: this.apiVersion ?? 'argoproj.io/v1alpha1',
            kind: 'WorkflowTemplate',
            metadata: this.metadata,
            spec: this.spec.toWorkflowSpec(),
        };
    }
}
