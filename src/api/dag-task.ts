import { IoArgoprojWorkflowV1Alpha1DAGTask } from '../workflow-interfaces/data-contracts.js';
import { LifecycleHook } from './lifecycle-hook.js';
import { StepOutput, TaskAndResult, TaskOutput } from './expressions/types.js';
import { BaseTaskOrStep } from './base-task-or-step.js';
import { WorkflowStep } from './workflow-step.js';
import { Template } from './template.js';
import { RecursiveTemplate } from './recursive-template.js';
import { LogicalExpression } from './expressions/classes.js';
import { getVariableReference } from './expressions/util.js';

export class DagTask extends BaseTaskOrStep {
    readonly isDagTask = true;

    dependencies?: string[];
    dependenciesExpressions?: DagTask[];
    depends?: string;
    dependsExpression?: TaskOutput | StepOutput | DagTask | TaskAndResult | WorkflowStep | LogicalExpression;

    constructor(name: string, init: Partial<DagTask>) {
        super(name);
        Object.assign(this, init);
    }

    toDagTask(dagName: string): IoArgoprojWorkflowV1Alpha1DAGTask {
        this.validateMutuallyExclusive(dagName);

        let templateName = undefined;
        if (this.template && (this.template as Template)) {
            templateName = (this.template as Template).name;
        } else if ((this.template as RecursiveTemplate)?.isRecursive) {
            templateName = (this.template as RecursiveTemplate).templateName;
        }

        let dependencies = this.dependencies;

        if (this?.dependenciesExpressions) {
            dependencies = (this?.dependenciesExpressions as DagTask[]).map((dep) => dep.name);
        }

        let depends = this.depends;

        if (this?.dependsExpression) {
            if ((this.dependsExpression as LogicalExpression)?.isLogicalExpression) {
                depends = (this?.dependsExpression as LogicalExpression).toString();
            } else if (this?.dependsExpression as TaskOutput | StepOutput | DagTask | TaskAndResult | WorkflowStep) {
                depends = getVariableReference(
                    this.dependsExpression as TaskOutput | StepOutput | DagTask | TaskAndResult | WorkflowStep,
                );
            }
        }

        return {
            arguments: this.arguments?.toArguments(`dag-task-${this.name}`),
            continueOn: this.continueOn,
            dependencies: dependencies,
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

    validateMutuallyExclusive(dagName: string) {
        super.validateMutuallyExclusive(dagName);

        let count = 0;

        if (this.depends) {
            count++;
        }

        if (this.dependsExpression) {
            count++;
        }

        if (this.dependencies) {
            count++;
        }

        if (count > 1) {
            throw new Error(
                `depends, dependsExpression, and dependencies are mutually exclusive on ${this.name} on dag ${dagName}`,
            );
        }

        count = 0;

        if (this.dependencies) {
            count++;
        }

        if (this.dependenciesExpressions) {
            count++;
        }
        if (count > 1) {
            throw new Error(
                `dependencies and dependenciesExpression are mutually exclusive on ${this.name} on dag ${dagName}`,
            );
        }
    }
}
