import {
    IoArgoprojWorkflowV1Alpha1CronWorkflowSpec,
    IoArgoprojWorkflowV1Alpha1StopStrategy,
    IoK8SApimachineryPkgApisMetaV1ObjectMeta,
} from '../workflow-interfaces/data-contracts.js';
import { WorkflowSpec } from './workflow-spec.js';

export class CronWorkflowSpec {
    concurrencyPolicy?: string;
    failedJobsHistoryLimit?: number;
    schedule?: string;
    schedules?: string[];
    startingDeadlineSeconds?: number;
    stopStrategy?: IoArgoprojWorkflowV1Alpha1StopStrategy;
    successfulJobsHistoryLimit?: number;
    suspend?: boolean;
    timezone?: string;
    when?: string;
    workflowMetadata?: IoK8SApimachineryPkgApisMetaV1ObjectMeta;
    workflowSpec!: WorkflowSpec;

    constructor(init?: Partial<CronWorkflowSpec>) {
        Object.assign(this, init);
    }

    toCronWorkflowSpec(): IoArgoprojWorkflowV1Alpha1CronWorkflowSpec {
        return {
            concurrencyPolicy: this.concurrencyPolicy,
            failedJobsHistoryLimit: this.failedJobsHistoryLimit,
            schedule: this.schedule,
            schedules: this.schedules,
            startingDeadlineSeconds: this.startingDeadlineSeconds,
            stopStrategy: this.stopStrategy,
            successfulJobsHistoryLimit: this.successfulJobsHistoryLimit,
            suspend: this.suspend,
            timezone: this.timezone,
            when: this.when,
            workflowMetadata: this.workflowMetadata,
            workflowSpec: this.workflowSpec.toWorkflowSpec(),
        };
    }
}
