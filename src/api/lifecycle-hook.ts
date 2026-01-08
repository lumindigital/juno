import { IoArgoprojWorkflowV1Alpha1LifecycleHook } from '../workflow-interfaces/data-contracts.js';
import { Arguments } from './arguments.js';
import { Template } from './template.js';
import { TemplateReference } from './template-reference.js';
import { ComparisonExpression } from './expressions/classes.js';

/**
 * Represents an Argo Lifecycle Hook
 * @remarks
 *
 *
 * @public
 */
export class LifecycleHook {
    arguments?: Arguments;

    expression?: string;
    expressionFrom?: ComparisonExpression;
    readonly name: string;
    template?: Template;

    templateRef?: TemplateReference;
    constructor(name: string, init?: Partial<LifecycleHook>) {
        this.name = name;
        Object.assign(this, init);
    }

    static convertLifecycleHooksRecord(
        hooks: LifecycleHook[],
    ): Record<string, IoArgoprojWorkflowV1Alpha1LifecycleHook> {
        const newHooks: Record<string, IoArgoprojWorkflowV1Alpha1LifecycleHook> = {};

        for (const hook of hooks) {
            newHooks[hook.name] = hook.toLifecycleHook();
        }

        return newHooks;
    }

    toLifecycleHook(): IoArgoprojWorkflowV1Alpha1LifecycleHook {
        if (this.template && this.templateRef) {
            throw new Error(`template and templateRef are mutually exclusive on lifecycle hook ${this.name}`);
        }

        if (this.expression && this.expressionFrom) {
            throw new Error(`expression and expressionFrom are mutually exclusive on lifecycle hook ${this.name}`);
        }

        let expression: string | undefined = this.expression;
        if (this.expressionFrom) {
            expression = this.expressionFrom.toString();
        }

        return {
            arguments: this.arguments?.toArguments(`lifecycle-hook-${this.name}`),
            expression: expression,
            template: this.template?.name,
            templateRef: this.templateRef?.toTemplateRef(),
        };
    }
}
