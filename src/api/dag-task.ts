import {
    IoArgoprojWorkflowV1Alpha1ContinueOn,
    IoArgoprojWorkflowV1Alpha1DAGTask,
    IoArgoprojWorkflowV1Alpha1Item,
    IoArgoprojWorkflowV1Alpha1Sequence,
} from '../workflow-interfaces/data-contracts.js';
import { Arguments } from './arguments.js';
import { LifecycleHook } from './lifecycle-hook.js';
import { InlineTemplate, Template } from './template.js';
import { TemplateReference } from './template-reference.js';
import { ExpressionArgs, simpleTag, WithParameterArgs } from './expression.js';
import { depends } from './expression.js';
import { InputParameter } from './parameter.js';

export class DagTask {
    readonly dagTask = true;
    arguments?: Arguments;
    continueOn?: IoArgoprojWorkflowV1Alpha1ContinueOn;
    dependencies?: DagTask[] | string[];
    depends?: ExpressionArgs;
    hooks?: LifecycleHook[];
    inline?: InlineTemplate;
    readonly name: string;
    /**
     * @deprecated Use `hooks` instead.
     */
    onExit?: Template;
    template?: Template;
    templateRef?: TemplateReference;
    when?: string;
    withItems?: IoArgoprojWorkflowV1Alpha1Item[];
    withParam?: string | InputParameter | WithParameterArgs;
    withSequence?: IoArgoprojWorkflowV1Alpha1Sequence;

    constructor(name: string, init: Partial<DagTask>) {
        this.name = name;
        Object.assign(this, init);
    }

    toDagTask(): IoArgoprojWorkflowV1Alpha1DAGTask {
        this.validateMutuallyExclusive();

        return {
            arguments: this.arguments?.toArguments(),
            continueOn: this.continueOn,
            dependencies: this.dependencies?.map((dep) => {
                if (typeof dep === 'string') {
                    return dep;
                }

                return dep.name;
            }),
            depends: this.depends ? depends(this.depends) : undefined,
            hooks: this.hooks ? LifecycleHook.convertLifecycleHooksRecord(this.hooks) : undefined,
            inline: this.inline?.toTemplate(),
            name: this.name,
            onExit: this.onExit ? this.onExit?.name : undefined,
            template: this.template?.name,
            templateRef: this.templateRef?.toTemplateRef(),
            when: this.when,
            withItems: this.withItems,
            withParam: convertToWithParam(this.withParam),
            withSequence: this.withSequence,
        };
    }

    validateMutuallyExclusive() {
        let count = 0;

        if (this.template) {
            count++;
        }

        if (this.templateRef) {
            count++;
        }

        if (this.inline) {
            count++;
        }

        if (count > 1) {
            throw new Error(`template, templateRef, and inline are mutually exclusive on ${this.name}`);
        }

        if (count === 0) {
            throw new Error(`One of template, templateRef, or inline is required on ${this.name}`);
        }
    }
}

function convertToWithParam(withParam: undefined | string | InputParameter | WithParameterArgs): string | undefined {
    if (withParam === undefined) {
        return undefined;
    }

    if (typeof withParam === 'string') {
        return withParam;
    }

    if ((withParam as InputParameter).isInputParameter !== undefined) {
        return simpleTag(withParam as InputParameter);
    }

    if ((withParam as WithParameterArgs).parameter !== undefined) {
        const withParamArgs = withParam as WithParameterArgs;

        if ((withParamArgs.task as DagTask).dagTask !== undefined) {
            return simpleTag({ task: withParamArgs.task as DagTask, parameter: withParamArgs.parameter });
        }
    }

    throw new Error('Invalid withParam type');
}
