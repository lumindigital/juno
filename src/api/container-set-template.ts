import {
    IoArgoprojWorkflowV1Alpha1ContainerSetRetryStrategy,
    IoArgoprojWorkflowV1Alpha1ContainerSetTemplate,
    IoK8SApiCoreV1VolumeMount,
} from '../workflow-interfaces/data-contracts.js';
import { ContainerNode } from './container-node.js';

export class ContainerSetTemplate {
    readonly containers: ContainerNode[];
    retryStrategy?: IoArgoprojWorkflowV1Alpha1ContainerSetRetryStrategy;
    volumeMounts?: IoK8SApiCoreV1VolumeMount[];

    constructor(containers: ContainerNode[], init?: Partial<ContainerSetTemplate>) {
        Object.assign(this, init);
        this.containers = containers;
    }

    toContainerSetTemplate(): IoArgoprojWorkflowV1Alpha1ContainerSetTemplate {
        return {
            containers: this.containers?.map((c) => c.toContainerNode()),
            retryStrategy: this.retryStrategy,
            volumeMounts: this.volumeMounts,
        };
    }
}
