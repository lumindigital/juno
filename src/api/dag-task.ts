import { IoArgoprojWorkflowV1Alpha1DAGTask } from '../workflow-interfaces/data-contracts.js';
import { LifecycleHook } from './lifecycle-hook.js';
import { getVariableReference, StepOutput, TaskAndResult, TaskOutput } from './expression.js';
import { BaseTaskOrStep } from './base-task-or-step.js';
import { WorkflowStep } from './workflow-step.js';
import { Template } from './template.js';
import { RecursiveTemplate } from './recursive-template.js';
import { LogicalExpression } from './expressions/classes.js';

export class DagTask extends BaseTaskOrStep {
    readonly isDagTask = true;

    dependencies?: DagTask[] | string[];
    depends?: string | TaskOutput | StepOutput | DagTask | TaskAndResult | WorkflowStep | LogicalExpression;

    constructor(name: string, init: Partial<DagTask>) {
        super(name);
        Object.assign(this, init);
    }

    toDagTask(): IoArgoprojWorkflowV1Alpha1DAGTask {
        this.validateMutuallyExclusive();

        let templateName = undefined;
        if (this.template && (this.template as Template)) {
            templateName = (this.template as Template).name;
        } else if ((this.template as RecursiveTemplate)?.isRecursive) {
            templateName = (this.template as RecursiveTemplate).templateName;
        }

        let depends: string | undefined = undefined;

        if ((this?.depends as LogicalExpression)?.isLogicalExpression) {
            depends = (this?.depends as LogicalExpression).toString();
        } else if (this.depends) {
            depends = getVariableReference(
                this.depends as string | TaskOutput | StepOutput | DagTask | TaskAndResult | WorkflowStep,
            );
        }

        return {
            arguments: this.arguments?.toArguments(),
            continueOn: this.continueOn,
            dependencies: this.dependencies?.map((dep) => {
                if (typeof dep === 'string') {
                    return dep;
                }

                return dep.name;
            }),
            depends: depends,
            hooks: this.hooks ? LifecycleHook.convertLifecycleHooksRecord(this.hooks) : undefined,
            inline: this.inline?.toTemplate(),
            name: this.name,
            onExit: this.onExit ? this.onExit?.name : undefined,
            template: this.template ? templateName : undefined,
            templateRef: this.templateRef?.toTemplateRef(),
            when: this.toWhenParam(),
            withItems: this.withItems,
            withParam: this.toWithParam(this.withParamExpression),
            withSequence: this.withSequence,
        };
    }
}
