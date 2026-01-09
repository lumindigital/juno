import {
    IoArgoprojWorkflowV1Alpha1Parameter,
    IoArgoprojWorkflowV1Alpha1ValueFrom,
} from '../workflow-interfaces/data-contracts.js';
import { ExpressionTemplateTag } from './expressions/classes.js';
import { simpleTag } from './expressions/tag.js';
import { ExpressionArgs } from './expressions/types.js';
import { ParameterValueFrom } from './parameter-value-from.js';

class Parameter {
    default?: string;

    description?: string;
    enum?: string[];
    globalName?: string;
    readonly name: string;
    value?: string;
    valueFrom?: ParameterValueFrom;
    valueFromExpressionArgs?: ExpressionArgs;
    valueFromExpressionTag?: ExpressionTemplateTag;

    constructor(name: string, init?: Partial<Parameter>) {
        this.name = name;
        Object.assign(this, init);
    }

    toParameter(templateName: string): IoArgoprojWorkflowV1Alpha1Parameter {
        this.validateMutuallyExclusive(templateName);

        let value = this.value;

        if (this.valueFromExpressionArgs) {
            value = simpleTag(this.valueFromExpressionArgs).toString();
        }

        if (this.valueFromExpressionTag) {
            value = this.valueFromExpressionTag.toString();
        }

        let valueFrom: IoArgoprojWorkflowV1Alpha1ValueFrom | undefined;
        if (this.valueFrom) {
            valueFrom = this.valueFrom.toValueFrom(templateName, this.name);
        }

        return {
            default: this.default,
            description: this.description,
            enum: this.enum,
            globalName: this.globalName,
            name: this.name,
            value,
            valueFrom: valueFrom,
        };
    }

    validateMutuallyExclusive(templateName: string) {
        let count = 0;
        if (this.value || this.value === '') {
            count++;
        }

        if (this.valueFrom) {
            count++;
        }

        if (this.valueFromExpressionArgs) {
            count++;
        }

        if (this.valueFromExpressionTag) {
            count++;
        }

        if (count > 1) {
<<<<<<< HEAD
            throw new Error(`value, valueFrom, and valueFromExpressionArgs are mutually exclusive on ${this.name}`);
=======
            throw new Error(
                `value, valueFrom, valueFromExpressionArgs, and valueFromExpressionTag are mutually exclusive on parameter ${this.name} on ${templateName}`,
            );
>>>>>>> 7faf7d8 (feat: added valueFromExpressionTag to artifacts and parameters)
        }
    }

    isValueSet(): boolean {
        return !!(
            this.value ||
            this.valueFrom ||
            this.valueFromExpressionArgs ||
            this.valueFromExpressionTag ||
            this.default
        );
    }
}

export class InputParameter extends Parameter {
    readonly isInputParameter = true;
    constructor(name: string, init?: Partial<InputParameter>) {
        super(name, init);
    }

    toArgumentParameter(init?: Partial<InputParameter>): ArgumentParameter {
        return new ArgumentParameter(this.name, init);
    }

    toWorkflowParameter(init?: Partial<InputParameter>): WorkflowParameter {
        return new WorkflowParameter(this.name, init);
    }
}

export class OutputParameter extends Parameter {
    readonly isOutputParameter = true;
    constructor(name: string, init?: Partial<OutputParameter>) {
        super(name, init);
    }
}

export class ArgumentParameter extends Parameter {
    readonly isArgumentParameter = true;
    constructor(name: string, init?: Partial<ArgumentParameter>) {
        super(name, init);
    }
}

export class WorkflowParameter extends Parameter {
    readonly isWorkflowParameter = true;
    constructor(name: string, init?: Partial<WorkflowParameter>) {
        super(name, init);
    }
}

export class FromItemProperty {
    readonly isFromItemProperty = true;
    itemKey?: string;
    constructor(itemKey?: string) {
        this.itemKey = itemKey;
    }
}
