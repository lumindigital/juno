import {
    IoArgoprojWorkflowV1Alpha1ClusterWorkflowTemplate,
    IoK8SApimachineryPkgApisMetaV1ObjectMeta,
} from '../workflow-interfaces/data-contracts.js';
import { WorkflowSpec } from './workflow-spec.js';

export class ClusterWorkflowTemplate {
    public apiVersion?: string;

    public metadata!: IoK8SApimachineryPkgApisMetaV1ObjectMeta;
    public spec!: WorkflowSpec;
    constructor(init?: Partial<ClusterWorkflowTemplate>) {
        Object.assign(this, init);
    }

    toClusterWorkflowTemplate(): IoArgoprojWorkflowV1Alpha1ClusterWorkflowTemplate {
        return {
            apiVersion: this.apiVersion ?? 'argoproj.io/v1alpha1',
            kind: 'ClusterWorkflowTemplate',
            metadata: this.metadata,
            spec: this.spec.toWorkflowSpec(),
        };
    }
}
