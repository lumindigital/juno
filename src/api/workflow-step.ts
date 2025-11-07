import { IoArgoprojWorkflowV1Alpha1WorkflowStep } from '../workflow-interfaces/data-contracts.js';
import { LifecycleHook } from './lifecycle-hook.js';
import { BaseTaskOrStep } from './base-task-or-step.js';
export class WorkflowStep extends BaseTaskOrStep {
    readonly isWorkflowStep = true;

    constructor(name: string, init?: Partial<WorkflowStep>) {
        super(name);
        Object.assign(this, init);
    }

    toWorkflowStep(): IoArgoprojWorkflowV1Alpha1WorkflowStep {
        this.validateMutuallyExclusive();

        return {
            arguments: this.arguments?.toArguments(),
            continueOn: this.continueOn,
            hooks: this.hooks ? LifecycleHook.convertLifecycleHooksRecord(this.hooks) : undefined,
            inline: this.inline?.toTemplate(),
            name: this.name,
            onExit: this.onExit ? this.onExit?.name : undefined,
            template: this.template ? this.template.name : undefined,
            templateRef: this.templateRef?.toTemplateRef(),
            when: this.when,
            withItems: this.withItems,
            withParam: this.toWithParam(this.withParam),
            withSequence: this.withSequence,
        };
    }
}
