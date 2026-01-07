import {
    IoArgoprojWorkflowV1Alpha1ArtifactRepositoryRef,
    IoArgoprojWorkflowV1Alpha1ExecutorConfig,
    IoArgoprojWorkflowV1Alpha1Metadata,
    IoArgoprojWorkflowV1Alpha1Metrics,
    IoArgoprojWorkflowV1Alpha1PodGC,
    IoArgoprojWorkflowV1Alpha1RetryStrategy,
    IoArgoprojWorkflowV1Alpha1Synchronization,
    IoArgoprojWorkflowV1Alpha1TTLStrategy,
    IoArgoprojWorkflowV1Alpha1VolumeClaimGC,
    IoArgoprojWorkflowV1Alpha1WorkflowLevelArtifactGC,
    IoArgoprojWorkflowV1Alpha1WorkflowMetadata,
    IoArgoprojWorkflowV1Alpha1WorkflowSpec,
    IoK8SApiCoreV1Affinity,
    IoK8SApiCoreV1HostAlias,
    IoK8SApiCoreV1LocalObjectReference,
    IoK8SApiCoreV1PersistentVolumeClaim,
    IoK8SApiCoreV1PodDNSConfig,
    IoK8SApiCoreV1PodSecurityContext,
    IoK8SApiCoreV1Toleration,
    IoK8SApiCoreV1Volume,
    IoK8SApiPolicyV1PodDisruptionBudgetSpec,
} from '../workflow-interfaces/data-contracts.js';
import { WorkflowArguments } from './arguments.js';
import { LifecycleHook } from './lifecycle-hook.js';
import { Template, TemplateDefaults } from './template.js';
import { WorkflowTemplateReference } from './workflow-template-reference.js';
import { ArgumentParameter, InputParameter } from './parameter.js';
import { DagTask } from './dag-task.js';
import { WorkflowStep } from './workflow-step.js';
import { ArgumentArtifact, InputArtifact } from './artifact.js';
import { TaskAndResult } from './expressions/types.js';
import { RecursiveTemplate } from './recursive-template.js';

/**
 * The juno workflow specification.
 * @public
 */
export class WorkflowSpec {
    activeDeadlineSeconds?: Required<number>;
    affinity?: IoK8SApiCoreV1Affinity;
    archiveLogs?: boolean;
    arguments?: WorkflowArguments;
    artifactGC?: IoArgoprojWorkflowV1Alpha1WorkflowLevelArtifactGC;
    artifactRepositoryRef?: IoArgoprojWorkflowV1Alpha1ArtifactRepositoryRef;
    automountServiceAccountToken?: boolean;
    dnsConfig?: IoK8SApiCoreV1PodDNSConfig;
    dnsPolicy?: string;
    /**
     * The entrypoint template for the workflow.
     * Any templates, including the entrypoint template itself, that are not templateRefs will automatically be included in the workflow.
     */
    entrypoint?: Template;
    executor?: IoArgoprojWorkflowV1Alpha1ExecutorConfig;

    /**
     * An array of lifecycle hooks.
     * Any templates defined by a lifecyclehook, that are not templateRefs will automatically be included in the workflow.
     */
    hooks?: LifecycleHook[];
    hostAliases?: IoK8SApiCoreV1HostAlias[];
    hostNetwork?: boolean;
    imagePullSecrets?: IoK8SApiCoreV1LocalObjectReference[];
    metrics?: IoArgoprojWorkflowV1Alpha1Metrics;
    nodeSelector?: Record<string, string>;
    /**
     * The onExit template for the workflow.
     * Any templates, including the onExit template itself, that are not templateRefs will automatically be included in the workflow.
     */
    onExit?: Template;
    parallelism?: number;
    podDisruptionBudget?: IoK8SApiPolicyV1PodDisruptionBudgetSpec;
    podGC?: IoArgoprojWorkflowV1Alpha1PodGC;
    podMetadata?: IoArgoprojWorkflowV1Alpha1Metadata;
    podPriorityClassName?: string;
    podSpecPatch?: string;
    retryStrategy?: IoArgoprojWorkflowV1Alpha1RetryStrategy;
    schedulerName?: string;
    securityContext?: IoK8SApiCoreV1PodSecurityContext;
    serviceAccountName?: string;
    shutdown?: string;
    suspend?: boolean;
    synchronization?: IoArgoprojWorkflowV1Alpha1Synchronization;
    templateDefaults?: TemplateDefaults;

    /**
     * This should never be used directly. If you need to add templates, use `additionalTemplates` instead.
     * @private
     */
    private templates: Template[] = [];
    /**
     * The only templates that need to be included here are templates that are only referenced by other templates via templateRef.
     * Generating a workflow will automatically include all templates that are required.
     */
    additionalTemplates?: Template[];
    tolerations?: IoK8SApiCoreV1Toleration[];
    ttlStrategy?: IoArgoprojWorkflowV1Alpha1TTLStrategy;
    volumeClaimGC?: IoArgoprojWorkflowV1Alpha1VolumeClaimGC;
    volumeClaimTemplates?: IoK8SApiCoreV1PersistentVolumeClaim[];
    volumes?: IoK8SApiCoreV1Volume[];
    workflowMetadata?: IoArgoprojWorkflowV1Alpha1WorkflowMetadata;
    workflowTemplateRef?: WorkflowTemplateReference;

    constructor(init?: Partial<WorkflowSpec>) {
        Object.assign(this, init);
    }

    validateVolumeClaimTemplates() {
        const volumeClaimNames = this.volumeClaimTemplates?.map((x) => x.metadata?.name) ?? [];

        for (const template of this.additionalTemplates ?? []) {
            const templateVolumeNames = template.volumes?.map((x) => x.name) ?? [];

            for (const volumeMount of template.script?.volumeMounts ?? []) {
                if (this.containsTag(volumeMount.name)) {
                    // We have no way to check expressions for correctness
                    continue;
                }

                if (!volumeClaimNames.includes(volumeMount.name) && !templateVolumeNames.includes(volumeMount.name)) {
                    throw new Error(
                        `Template ${template.name} has a volumeMount named ${volumeMount.name} in script that references a volume not included in volumeClaimTemplates or template volumes`,
                    );
                }
            }

            for (const volumeMount of template.container?.volumeMounts ?? []) {
                if (this.containsTag(volumeMount.name)) {
                    // We have no way to check expressions for correctness
                    continue;
                }

                if (!volumeClaimNames.includes(volumeMount.name) && !templateVolumeNames.includes(volumeMount.name)) {
                    throw new Error(
                        `Template ${template.name} has a volumeMount named ${volumeMount.name} in a container that references a volume not included in volumeClaimTemplates or template volumes`,
                    );
                }
            }
        }
    }

    validateWorkflow() {
        const templates = [...(this.additionalTemplates ?? [])];

        // Ignore adding entrypoint if workflowTemplateRef is set as the template does not need to be included.
        if (this.entrypoint && !this.workflowTemplateRef) {
            templates.push(this.entrypoint);
            this.validateEntryPoint();
        }

        if (this.onExit) {
            templates.push(this.onExit);
        }

        if (this.hooks) {
            for (const hook of this.hooks) {
                if (hook.template) {
                    templates.push(hook.template);
                }
            }
        }

        for (const template of templates) {
            this.validateTemplate(template);
        }

        const dupeTemplateNames: string[] = [];

        this.templates = this.templates.reduce((acc, template) => {
            const existing = acc.find((x) => x.name === template.name);
            if (!existing) {
                acc.push(template);
            } else {
                if (existing.id !== template.id) {
                    dupeTemplateNames.push(template.name);
                }
            }
            return acc;
        }, [] as Template[]);

        if (dupeTemplateNames.length > 0) {
            throw new Error(`Duplicate template names found: ${dupeTemplateNames.join(', ')}`);
        }

        this.validateRecursiveTemplates();

        this.templates = this.templates.sort((a, b) => a.name.localeCompare(b.name));

        this.validateVolumeClaimTemplates();
    }

    validateRecursiveTemplates() {
        for (const template of this.templates) {
            if (template && template.dag) {
                for (const task of template.dag.tasks) {
                    if ((task.template && (task.template as RecursiveTemplate))?.isRecursive) {
                        const recursiveTemplate = task.template as RecursiveTemplate;

                        const found = this.templates.find((x) => x.name === recursiveTemplate.templateName);
                        if (!found) {
                            throw new Error(
                                `Dag task ${task.name} on template ${template.name} references a recursive template ${recursiveTemplate.templateName} not found in workflow templates`,
                            );
                        }

                        //recursiveTemplates.push(task.template as RecursiveTemplate);
                    }
                }
            }

            if (template && template.steps) {
                for (const stepGroup of template.steps) {
                    for (const step of stepGroup) {
                        if ((step.template && (step.template as RecursiveTemplate))?.isRecursive) {
                            const recursiveTemplate = step.template as RecursiveTemplate;

                            const found = this.templates.find((x) => x.name === recursiveTemplate.templateName);
                            if (!found) {
                                throw new Error(
                                    `Workflow step ${step.name} on template ${template.name} references a recursive template ${recursiveTemplate.templateName} not found in workflow templates`,
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    validateTemplate(template: Template) {
        this.templates.push(template);

        template.validateWorkflowParameters(this.arguments?.parameters ?? []);
        this.validateDags(template);
        this.validateSteps(template);
    }

    validateSteps(template: Template) {
        if (template && template.steps) {
            for (const step of template.steps) {
                for (const task of step) {
                    if ((task.template && (task.template as RecursiveTemplate))?.isRecursive) {
                        continue;
                    }

                    if (task.template && task.inline) {
                        throw new Error(
                            `Step ${task.name} on template ${template.name} cannot include both a template and an inline template`,
                        );
                    }

                    if (!task.template && !task.templateRef && !task.inline) {
                        throw new Error(
                            `Step ${task.name} on template ${template.name} must include either a template, templateRef or inline template`,
                        );
                    }

                    this.validateTaskTemplate(task);
                    this.validateTaskTemplateRef(task);
                }
            }
        }
    }

    validateDags(template: Template) {
        if (template && template.dag) {
            for (const task of template.dag.tasks) {
                if ((task.template && (task.template as RecursiveTemplate))?.isRecursive) {
                    continue;
                }

                if (task.template && task.inline) {
                    throw new Error(
                        `Task ${task.name} on template ${template.name} cannot include both a template and an inline template`,
                    );
                }

                if (!task.template && !task.templateRef && !task.inline) {
                    throw new Error(
                        `Task ${task.name} on template ${template.name} must include either a template, templateRef or inline template`,
                    );
                }

                if (task.depends) {
                    if ((task.depends as DagTask).isDagTask) {
                        const dagTask = task.depends as DagTask;

                        if (!template.dag.tasks.find((x) => x.name === dagTask.name)) {
                            throw new Error(
                                `Dependency ${dagTask.name} in dag task ${task.name} is not included in template ${template.name}`,
                            );
                        }
                    } else if (
                        (task.depends as TaskAndResult).task !== undefined &&
                        (task.depends as TaskAndResult).result !== undefined
                    ) {
                        const taskAndResult = task.depends as TaskAndResult;

                        if ((taskAndResult.task as WorkflowStep).isWorkflowStep !== undefined) {
                            throw new Error(
                                `Dependency on ${taskAndResult.task.name} is not valid in a dag task ${task.name} on template ${template.name}`,
                            );
                        }

                        if (!template.dag.tasks.find((x) => x.name === taskAndResult.task.name)) {
                            throw new Error(
                                `Dependency ${taskAndResult.task.name} in dag task ${task.name} is not included in template ${template.name}`,
                            );
                        }
                    } else if ((task.depends as WorkflowStep).isWorkflowStep) {
                        const workflowStep = task.depends as WorkflowStep;
                        throw new Error(
                            `Dependency on ${workflowStep.name} is not valid in a dag task ${task.name} on template ${template.name}`,
                        );
                    } else if (typeof task.depends === 'string') {
                        // Do nothing, we have no way to validate strings
                    }
                }

                if (task.dependencies) {
                    for (const dep of task.dependencies) {
                        const errors = [];

                        if ((dep as DagTask).isDagTask !== undefined) {
                            const depDagTask = dep as DagTask;

                            if (!template.dag.tasks.find((x) => x.name === depDagTask.name)) {
                                errors.push(
                                    `Dependency ${depDagTask.name} in dag task ${task.name} is not included in template ${template.name}`,
                                );

                                throw new Error(errors.join(', '));
                            } else if (typeof dep === 'string') {
                                // Do nothing, we have no way to validate strings
                            }
                        }
                    }
                }

                this.validateTaskTemplate(task);
                this.validateTaskTemplateRef(task);
            }
        }
    }

    validateTaskTemplateRef(task: DagTask | WorkflowStep) {
        if (!task.templateRef) {
            return;
        }

        const missingParameterArguments = this.getMissingArguments(
            task.templateRef.template.inputs?.parameters ?? [],
            task.arguments?.parameters ?? [],
        );
        if (missingParameterArguments.length > 0) {
            throw new Error(
                `${task.name} references a template named ${task.templateRef?.template?.name} and is missing parameter argument(s) (${missingParameterArguments.join(', ')})`,
            );
        }

        const missingArtifactArguments = this.getMissingArguments(
            task.templateRef.template.inputs?.artifacts ?? [],
            task.arguments?.artifacts ?? [],
        );

        if (missingArtifactArguments.length > 0) {
            throw new Error(
                `${task.name} references a template named ${task.templateRef?.template?.name} and is missing artifact argument(s) (${missingArtifactArguments.join(', ')})`,
            );
        }
    }

    validateTaskTemplate(task: DagTask | WorkflowStep) {
        if (!task.template) {
            return;
        }

        if ((task.template as RecursiveTemplate)?.isRecursive) {
            return;
        }

        const template = task.template as Template;

        this.validateTemplate(template);

        const missingParameterArguments = this.getMissingArguments(
            template.inputs?.parameters ?? [],
            task.arguments?.parameters ?? [],
        );
        if (missingParameterArguments.length > 0) {
            throw new Error(
                `${task.name} is missing parameter argument(s) (${missingParameterArguments.join(', ')}) defined on template ${template?.name}`,
            );
        }

        const missingArtifactArguments = this.getMissingArguments(
            template.inputs?.artifacts ?? [],
            task.arguments?.artifacts ?? [],
        );
        if (missingArtifactArguments.length > 0) {
            throw new Error(
                `${task.name} is missing artifact argument(s) (${missingArtifactArguments.join(', ')}) defined on template ${template?.name}`,
            );
        }

        if (task.hooks) {
            for (const hook of task.hooks) {
                if (hook.template) {
                    this.validateTemplate(hook.template);
                }
            }
        }

        if (task.onExit) {
            this.validateTemplate(task.onExit);
        }
    }

    getMissingArguments(
        templateParameters: InputParameter[] | InputArtifact[],
        argumentParameters: ArgumentParameter[] | ArgumentArtifact[],
    ): string[] {
        const missingArguments = [];

        for (const param of templateParameters) {
            if ((param as InputParameter).isInputParameter) {
                const inputParam = param as InputParameter;
                if (inputParam.value || inputParam.default) {
                    continue;
                }

                // I'm not 100% sure about continue block, since I widened the scope for input parameters it seems reasonable
                //  as there might be some cases I'm missing that need this other than WorkflowOutput
                if (inputParam.valueFromExpressionArgs) {
                    continue;
                }
            }

            if (!argumentParameters.find((x) => x.name === param.name)) {
                if ((param as InputArtifact)?.isInputArtifact) {
                    const inputArtifact = param as InputArtifact;

                    if (!inputArtifact.from) {
                        continue;
                    }
                }

                missingArguments.push(param.name);
            }
        }

        return missingArguments;
    }

    toWorkflowSpec(): IoArgoprojWorkflowV1Alpha1WorkflowSpec {
        this.validateWorkflow();

        const result = {
            activeDeadlineSeconds: this.activeDeadlineSeconds,
            affinity: this.affinity,
            archiveLogs: this.archiveLogs,
            arguments: this.arguments?.toArguments('workflow'),
            artifactGC: this.artifactGC,
            artifactRepositoryRef: this.artifactRepositoryRef,
            automountServiceAccountToken: this.automountServiceAccountToken,
            dnsConfig: this.dnsConfig,
            dnsPolicy: this.dnsPolicy,
            entrypoint: this.entrypoint ? this.entrypoint.name : undefined,
            executor: this.executor,
            hooks: this.hooks ? LifecycleHook.convertLifecycleHooksRecord(this.hooks) : undefined,
            hostAliases: this.hostAliases,
            hostNetwork: this.hostNetwork,
            imagePullSecrets: this.imagePullSecrets,
            metrics: this.metrics,
            nodeSelector: this.nodeSelector,
            onExit: this.onExit ? this.onExit?.name : undefined,
            parallelism: this.parallelism,
            podDisruptionBudget: this.podDisruptionBudget,
            podGC: this.podGC,
            podMetadata: this.podMetadata,
            podPriorityClassName: this.podPriorityClassName,
            podSpecPatch: this.podSpecPatch,
            retryStrategy: this.retryStrategy,
            schedulerName: this.schedulerName,
            securityContext: this.securityContext,
            serviceAccountName: this.serviceAccountName,
            shutdown: this.shutdown,
            suspend: this.suspend,
            synchronization: this.synchronization,
            templateDefaults: this.templateDefaults?.toTemplate(),
            templates: this.templates.map((x) => x.toTemplate()),
            tolerations: this.tolerations,
            ttlStrategy: this.ttlStrategy,
            volumeClaimGC: this.volumeClaimGC,
            volumeClaimTemplates: this.volumeClaimTemplates,
            volumes: this.volumes,
            workflowMetadata: this.workflowMetadata,
            workflowTemplateRef: this.workflowTemplateRef?.toWorkflowTemplateReference(),
        };

        return result;
    }

    validateEntryPoint() {
        if (!this.entrypoint) {
            return;
        }

        const workflowParams = this?.arguments?.parameters ?? [];

        for (const param of this.entrypoint.inputs?.parameters ?? []) {
            if (param.isValueSet()) {
                continue;
            }

            if (!workflowParams.find((x) => x.name === param.name)) {
                throw new Error(`Missing parameter(s) (${param.name}) for entrypoint template ${this.entrypoint.name}`);
            }
        }
    }

    containsTag(input: string): boolean {
        return input.includes('{{') && input.includes('}}');
    }
}
