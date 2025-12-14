import {
    IoArgoprojWorkflowV1Alpha1ContinueOn,
    IoArgoprojWorkflowV1Alpha1Item,
    IoArgoprojWorkflowV1Alpha1Sequence,
} from '../workflow-interfaces/data-contracts.js';
import { Arguments } from './arguments.js';
import { TaskOutput, StepOutput, simpleTag, StepOutputParameters, TaskOutputParameters } from './expression.js';
import { LifecycleHook } from './lifecycle-hook.js';
import { InputParameter } from './parameter.js';
import { RecursiveTemplate } from './recursive-template.js';
import { TemplateReference } from './template-reference.js';
import { InlineTemplate, Template } from './template.js';

export class BaseTaskOrStep {
    arguments?: Arguments;
    continueOn?: IoArgoprojWorkflowV1Alpha1ContinueOn;
    hooks?: LifecycleHook[];
    inline?: InlineTemplate;
    /**
     * @deprecated Use `hooks` instead.
     */
    onExit?: Template;
    template?: Template | RecursiveTemplate;
    templateRef?: TemplateReference;
    when?: string;
    withItems?: IoArgoprojWorkflowV1Alpha1Item[];
    withParamExpression?:
        | string
        | InputParameter
        | TaskOutput
        | StepOutput
        | StepOutputParameters
        | TaskOutputParameters;
    withSequence?: IoArgoprojWorkflowV1Alpha1Sequence;

    readonly name: string;
    constructor(name: string) {
        this.name = name;
    }

    protected toWithParam(
        withParam:
            | undefined
            | string
            | InputParameter
            | TaskOutput
            | StepOutput
            | StepOutputParameters
            | TaskOutputParameters,
    ): string | undefined {
        if (!withParam) {
            return undefined;
        }

        if (typeof withParam === 'string') {
            return withParam;
        }

        try {
            return simpleTag(withParam);
        } catch (error) {
            throw new Error(`WithParam on DagTask ${this.name} failed: ${error}`);
            return undefined;
        }
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
