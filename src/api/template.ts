import {
    IoArgoprojWorkflowV1Alpha1ArtifactLocation,
    IoArgoprojWorkflowV1Alpha1Data,
    IoArgoprojWorkflowV1Alpha1ExecutorConfig,
    IoArgoprojWorkflowV1Alpha1HTTP,
    IoArgoprojWorkflowV1Alpha1Memoize,
    IoArgoprojWorkflowV1Alpha1Metadata,
    IoArgoprojWorkflowV1Alpha1Metrics,
    IoArgoprojWorkflowV1Alpha1Plugin,
    IoArgoprojWorkflowV1Alpha1ResourceTemplate,
    IoArgoprojWorkflowV1Alpha1RetryStrategy,
    IoArgoprojWorkflowV1Alpha1SuspendTemplate,
    IoArgoprojWorkflowV1Alpha1Synchronization,
    IoArgoprojWorkflowV1Alpha1Template,
    IoK8SApiCoreV1Affinity,
    IoK8SApiCoreV1HostAlias,
    IoK8SApiCoreV1PodSecurityContext,
    IoK8SApiCoreV1Toleration,
    IoK8SApiCoreV1Volume,
    IoK8SApimachineryPkgUtilIntstrIntOrString,
} from '../workflow-interfaces/data-contracts.js';
import { ContainerSetTemplate } from './container-set-template.js';
import { Container } from './container.js';
import { DagTemplate } from './dag-template.js';
import { Inputs } from './inputs.js';
import { Outputs } from './outputs.js';
import { InputParameter, WorkflowParameter } from './parameter.js';
import { Script } from './script.js';
import { UserContainer } from './user-container.js';
import { WorkflowStep } from './workflow-step.js';
import { randomUUID } from 'crypto';

export class BaseTemplate {
    readonly isTemplate: boolean;
    readonly id: string;
    activeDeadlineSeconds?: IoK8SApimachineryPkgUtilIntstrIntOrString;
    affinity?: IoK8SApiCoreV1Affinity;
    annotations?: Record<string, string>;
    archiveLocation?: IoArgoprojWorkflowV1Alpha1ArtifactLocation;
    automountServiceAccountToken?: boolean;
    container?: Container;
    containerSet?: ContainerSetTemplate;
    daemon?: boolean;
    dag?: DagTemplate;
    data?: IoArgoprojWorkflowV1Alpha1Data;
    executor?: IoArgoprojWorkflowV1Alpha1ExecutorConfig;
    failFast?: boolean;
    hostAliases?: IoK8SApiCoreV1HostAlias[];
    http?: IoArgoprojWorkflowV1Alpha1HTTP;
    initContainers?: UserContainer[];
    inputs?: Inputs;
    memoize?: IoArgoprojWorkflowV1Alpha1Memoize;
    metadata?: IoArgoprojWorkflowV1Alpha1Metadata;
    metrics?: IoArgoprojWorkflowV1Alpha1Metrics;
    name: string | undefined;
    nodeSelector?: Record<string, string>;
    outputs?: Outputs;
    parallelism?: number;
    plugin?: IoArgoprojWorkflowV1Alpha1Plugin;
    podSpecPatch?: string;
    priorityClassName?: string;
    resource?: IoArgoprojWorkflowV1Alpha1ResourceTemplate;
    retryStrategy?: IoArgoprojWorkflowV1Alpha1RetryStrategy;
    schedulerName?: string;
    script?: Script;
    securityContext?: IoK8SApiCoreV1PodSecurityContext;
    serviceAccountName?: string;
    sidecars?: UserContainer[];
    steps?: WorkflowStep[][];
    suspend?: IoArgoprojWorkflowV1Alpha1SuspendTemplate;
    synchronization?: IoArgoprojWorkflowV1Alpha1Synchronization;
    timeout?: string;
    tolerations?: IoK8SApiCoreV1Toleration[];
    volumes?: IoK8SApiCoreV1Volume[];
    constructor(name: string, init?: Partial<Template>) {
        this.id = randomUUID();
        this.name = name;
        this.isTemplate = true;
        Object.assign(this, init);
    }

    toTemplate(): IoArgoprojWorkflowV1Alpha1Template {
        const steps = this.steps?.map((x) => x.map((y) => y.toWorkflowStep(this.name ?? '')));
        this.validateEnvironmentVariables();

        return {
            activeDeadlineSeconds: this.activeDeadlineSeconds,
            affinity: this.affinity,
            archiveLocation: this.archiveLocation,
            automountServiceAccountToken: this.automountServiceAccountToken,
            container: this.container?.toContainer(),
            containerSet: this.containerSet?.toContainerSetTemplate(),
            daemon: this.daemon,
            dag: this.dag?.toDagTemplate(this.name ?? ''),
            data: this.data,
            executor: this.executor,
            failFast: this.failFast,
            hostAliases: this.hostAliases,
            http: this.http,
            initContainers: this.initContainers?.map((x) => x.toUserContainer()),
            inputs: this.inputs?.toInputs(`template-${this.name ?? ''}`),
            memoize: this.memoize,
            metadata: this.metadata,
            metrics: this.metrics,
            name: this.name,
            nodeSelector: this.nodeSelector,
            outputs: this.outputs?.toOutputs(`template-${this.name ?? ''}`),
            parallelism: this.parallelism,
            plugin: this.plugin,
            podSpecPatch: this.podSpecPatch,
            priorityClassName: this.priorityClassName,
            resource: this.resource,
            retryStrategy: this.retryStrategy,
            schedulerName: this.schedulerName,
            script: this.script?.toScript(),
            securityContext: this.securityContext,
            serviceAccountName: this.serviceAccountName,
            sidecars: this.sidecars?.map((x) => x.toUserContainer()),
            steps,
            suspend: this.suspend,
            synchronization: this.synchronization,
            timeout: this.timeout,
            tolerations: this.tolerations,
            volumes: this.volumes,
        };
    }

    validateEnvironmentVariables() {
        const inputNames = this.inputs?.parameters?.map((x) => x.name);
        for (const env of this.script?.env ?? []) {
            if (env.valueFromInputParameter && !inputNames?.includes(env.valueFromInputParameter.name)) {
                throw new Error(
                    `Template ${this.name} references an input parameter ${env.valueFromInputParameter.name} in script that is not included in inputs`,
                );
            }
        }

        for (const env of this.container?.env ?? []) {
            if (env.valueFromInputParameter && !inputNames?.includes(env.valueFromInputParameter.name)) {
                throw new Error(
                    `Template ${this.name} references an input parameter ${env.valueFromInputParameter.name} in container that is not included in inputs`,
                );
            }
        }

        for (const containerSetContainer of this.containerSet?.containers ?? []) {
            for (const env of containerSetContainer?.env ?? []) {
                if (env.valueFromInputParameter && !inputNames?.includes(env.valueFromInputParameter.name)) {
                    throw new Error(
                        `Template ${this.name} references an input parameter ${env.valueFromInputParameter.name} in containerSet.container ${containerSetContainer.name} that is not included in inputs`,
                    );
                }
            }
        }

        for (const initContainer of this.initContainers ?? []) {
            for (const env of initContainer.env ?? []) {
                if (env.valueFromInputParameter && !inputNames?.includes(env.valueFromInputParameter.name)) {
                    throw new Error(
                        `Template ${this.name} references an input parameter ${env.valueFromInputParameter.name} in init container ${initContainer.name} that is not included in template inputs`,
                    );
                }
            }
        }

        for (const sidecar of this.sidecars ?? []) {
            for (const env of sidecar.env ?? []) {
                if (env.valueFromInputParameter && !inputNames?.includes(env.valueFromInputParameter.name)) {
                    throw new Error(
                        `Template ${this.name} references an input parameter ${env.valueFromInputParameter.name} in sidecar ${sidecar.name} that is not included in template inputs`,
                    );
                }
            }
        }

        for (const dagTask of this.dag?.tasks ?? []) {
            for (const inputParameter of dagTask.arguments?.parameters ?? []) {
                if (!(inputParameter.valueFromExpressionArgs as InputParameter)?.isInputParameter) {
                    continue;
                }

                const inputParameterValueFromExpressionArgs = inputParameter.valueFromExpressionArgs as InputParameter;

                if (
                    inputParameterValueFromExpressionArgs &&
                    !inputNames?.includes(inputParameterValueFromExpressionArgs.name)
                ) {
                    throw new Error(
                        `Template ${this.name} references an input parameter ${inputParameterValueFromExpressionArgs.name} in dag task ${dagTask.name} that is not included in template inputs`,
                    );
                }
            }
        }

        for (const step of this.steps ?? []) {
            for (const innerStep of step) {
                for (const inputParameter of innerStep.arguments?.parameters ?? []) {
                    if (!(inputParameter.valueFromExpressionArgs as InputParameter)?.isInputParameter) {
                        continue;
                    }

                    const inputParameterValueFromExpressionArgs =
                        inputParameter.valueFromExpressionArgs as InputParameter;

                    if (
                        inputParameterValueFromExpressionArgs &&
                        !inputNames?.includes(inputParameterValueFromExpressionArgs?.name)
                    ) {
                        throw new Error(
                            `Template ${this.name} references an input parameter ${inputParameterValueFromExpressionArgs?.name} in step ${innerStep.name} that is not included in template inputs`,
                        );
                    }
                }
            }
        }
    }

    validateWorkflowParameters(workflowParameters: WorkflowParameter[]) {
        const argumentNames = workflowParameters?.map((x) => x.name);

        for (const param of this.inputs?.parameters ?? []) {
            if (!(param.valueFromExpressionArgs as WorkflowParameter)?.isWorkflowParameter) {
                continue;
            }

            const workflowParameterValueFromExpressionArgs = param.valueFromExpressionArgs as WorkflowParameter;

            if (!argumentNames?.includes(workflowParameterValueFromExpressionArgs.name)) {
                throw new Error(
                    `Template ${this.name} references a workflow parameter ${workflowParameterValueFromExpressionArgs.name} in inputs that is not defined in workflow parameters`,
                );
            }
        }

        for (const innersteps of this.steps ?? []) {
            for (const step of innersteps ?? []) {
                for (const param of step.arguments?.parameters?.map((x) => x.valueFromExpressionArgs) ?? []) {
                    if (!(param as WorkflowParameter)?.isWorkflowParameter) {
                        continue;
                    }

                    const workflowParameterValueFromExpressionArgs = param as WorkflowParameter;

                    if (!argumentNames?.includes(workflowParameterValueFromExpressionArgs.name)) {
                        throw new Error(
                            `Parameter ${workflowParameterValueFromExpressionArgs.name} on workflow step ${step.name} is not a defined workflow parameter`,
                        );
                    }
                }
            }
        }

        for (const dagTask of this.dag?.tasks ?? []) {
            for (const param of dagTask.arguments?.parameters?.map((x) => x.valueFromExpressionArgs) ?? []) {
                if (!(param as WorkflowParameter)?.isWorkflowParameter) {
                    continue;
                }

                const workflowParameterValueFromExpressionArgs = param as WorkflowParameter;

                if (!argumentNames?.includes(workflowParameterValueFromExpressionArgs.name)) {
                    throw new Error(
                        `Parameter ${workflowParameterValueFromExpressionArgs.name} on dag task ${dagTask.name} is not a defined workflow parameter`,
                    );
                }
            }
        }
    }
}
export class Template extends BaseTemplate {
    declare name: string;
}

export class TemplateDefaults extends BaseTemplate {
    constructor(init?: Partial<TemplateDefaults>) {
        super('', init);
        delete this.name;
    }
}

export class InlineTemplate extends BaseTemplate {
    constructor(init?: Partial<InlineTemplate>) {
        super('', init);
        delete this.name;
    }
}
