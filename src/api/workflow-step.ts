import { IoArgoprojWorkflowV1Alpha1WorkflowStep } from '../workflow-interfaces/data-contracts.js';
import { LifecycleHook } from './lifecycle-hook.js';
import { BaseTaskOrStep } from './base-task-or-step.js';
import { Template } from './template.js';
import { RecursiveTemplate } from './recursive-template.js';
export class WorkflowStep extends BaseTaskOrStep {
    readonly isWorkflowStep = true;

    constructor(name: string, init?: Partial<WorkflowStep>) {
        super(name);
        Object.assign(this, init);
    }

    toWorkflowStep(workflowStepName: string): IoArgoprojWorkflowV1Alpha1WorkflowStep {
        this.validateMutuallyExclusive(workflowStepName);

        let templateName = undefined;
        if (this.template && (this.template as Template).isTemplate) {
            templateName = (this.template as Template).name;
        } else if ((this.template as RecursiveTemplate)?.isRecursive) {
            templateName = (this.template as RecursiveTemplate).templateName;
        }

        return {
            arguments: this.arguments?.toArguments(`workflow-step-${this.name}`),
            continueOn: this.continueOn,
            hooks: this.hooks ? LifecycleHook.convertLifecycleHooksRecord(this.hooks) : undefined,
            inline: this.inline?.toTemplate(),
            name: this.name,
            onExit: this.onExit ? this.onExit?.name : undefined,
            template: templateName,
            templateRef: this.templateRef?.toTemplateRef(),
            when: this.toWhenParam(),
            withItems: this.withItems,
            withParam: this.toWithParam(this.withParamExpression),
            withSequence: this.withSequence,
        };
    }
}
