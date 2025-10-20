import {
    IoArgoprojWorkflowV1Alpha1CronWorkflow,
    IoK8SApimachineryPkgApisMetaV1ObjectMeta,
} from '../workflow-interfaces/data-contracts.js';
import { CronWorkflowSpec } from './cron-workflow-spec.js';

export class CronWorkflow {
    public apiVersion?: string;

    public metadata!: IoK8SApimachineryPkgApisMetaV1ObjectMeta;
    public spec!: CronWorkflowSpec;
    constructor(init?: Partial<CronWorkflow>) {
        Object.assign(this, init);
    }

    toCronWorkflowTemplate(): IoArgoprojWorkflowV1Alpha1CronWorkflow {
        return {
            apiVersion: this.apiVersion ?? 'argoproj.io/v1alpha1',
            kind: 'CronWorkflow',
            metadata: this.metadata,
            spec: this.spec.toCronWorkflowSpec(),
        };
    }
}
