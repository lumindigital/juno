import {
    IoArgoprojWorkflowV1Alpha1Parameter,
    IoArgoprojWorkflowV1Alpha1ValueFrom,
} from '../workflow-interfaces/data-contracts.js';
import { simpleTag, StepOutput, TaskOutput } from './expression.js';

class Parameter {
    default?: string;

    description?: string;
    enum?: string[];
    globalName?: string;
    readonly name: string;
    value?: string;
    valueFrom?: IoArgoprojWorkflowV1Alpha1ValueFrom;
    valueFromInputParameter?: InputParameter;
    valueFromWorkflowParameter?: WorkflowParameter;
    valueFromOutputParameter?: TaskOutput | StepOutput;
    valueFromItemProperty?: FromItemProperty;
    constructor(name: string, init?: Partial<Parameter>) {
        this.name = name;
        Object.assign(this, init);
    }

    toParameter(): IoArgoprojWorkflowV1Alpha1Parameter {
        this.validateMutuallyExclusive();

        let value = this.value;

        if (this.valueFromInputParameter) {
            value = simpleTag(this.valueFromInputParameter);
        }

        if (this.valueFromWorkflowParameter) {
            value = simpleTag(this.valueFromWorkflowParameter);
        }

        if (this.valueFromOutputParameter) {
            value = simpleTag(this.valueFromOutputParameter);
        }

        if (this.valueFromItemProperty) {
            value = simpleTag(this.valueFromItemProperty);
        }

        return {
            default: this.default,
            description: this.description,
            enum: this.enum,
            globalName: this.globalName,
            name: this.name,
            value,
            valueFrom: this.valueFrom,
        };
    }

    validateMutuallyExclusive() {
        let count = 0;
        if (this.value || this.value === '') {
            count++;
        }

        if (this.valueFrom) {
            count++;
        }

        if (this.valueFromInputParameter) {
            count++;
        }

        if (this.valueFromWorkflowParameter) {
            count++;
        }

        if (this.valueFromOutputParameter) {
            count++;
        }

        if (count > 1) {
            throw new Error(
                `value, valueFrom, valueFromInputParameter, valueFromOutputParameter, and valueFromWorkflowParameter are mutually exclusive on ${this.name}`,
            );
        }
    }

    isValueSet(): boolean {
        return !!(
            this.value ||
            this.valueFrom ||
            this.valueFromInputParameter ||
            this.valueFromWorkflowParameter ||
            this.valueFromOutputParameter ||
            this.default
        );
    }
}

export class InputParameter extends Parameter {
    readonly isInputParameter = true;
    constructor(name: string, init?: Partial<InputParameter>) {
        super(name, init);
    }

    toArgumentParameter(init?: Partial<Parameter>): ArgumentParameter {
        return new ArgumentParameter(this.name, init);
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
