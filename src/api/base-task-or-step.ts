import {
    IoArgoprojWorkflowV1Alpha1ContinueOn,
    IoArgoprojWorkflowV1Alpha1Item,
    IoArgoprojWorkflowV1Alpha1Sequence,
} from '../workflow-interfaces/data-contracts.js';
import { Arguments } from './arguments.js';

import { ComparisonExpression, ExpressionTemplateTag, LogicalExpression } from './expressions/classes.js';
import { simpleTag } from './expressions/tag.js';
import { TaskOutput, StepOutput, StepOutputParameters, TaskOutputParameters } from './expressions/types.js';
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
    whenExpression?: ExpressionTemplateTag | ComparisonExpression | LogicalExpression;
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
            return simpleTag(withParam).toString();
        } catch (error) {
            throw new Error(`WithParam on DagTask ${this.name} failed: ${error}`);
        }
    }

    protected toWhenParam(): string | undefined {
        if (this.whenExpression) {
            return this.whenExpression.toString();
        }

        return this.when;
    }

    validateMutuallyExclusive(parentName: string) {
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
            throw new Error(
                `template, templateRef, and inline are mutually exclusive on ${this.name} on ${parentName}`,
            );
        }

        if (count === 0) {
            throw new Error(`One of template, templateRef, or inline is required on ${this.name} on ${parentName}`);
        }

        count = 0;

        if (this.when) {
            count++;
        }

        if (this.whenExpression) {
            count++;
        }

        if (count > 1) {
            throw new Error(`when and whenExpressionTag are mutually exclusive on ${this.name} on ${parentName}`);
        }
    }
}
