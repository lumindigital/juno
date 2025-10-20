import { IoArgoprojWorkflowV1Alpha1LifecycleHook } from '../workflow-interfaces/data-contracts.js';
import { Arguments } from './arguments.js';
import { Template } from './template.js';
import { TemplateReference } from './template-reference.js';

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

        return {
            arguments: this.arguments?.toArguments(),
            expression: this.expression,
            template: this.template?.name,
            templateRef: this.templateRef?.toTemplateRef(),
        };
    }
}
