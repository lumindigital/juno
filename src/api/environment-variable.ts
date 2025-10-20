import { IoK8SApiCoreV1EnvVar, IoK8SApiCoreV1EnvVarSource } from '../workflow-interfaces/data-contracts.js';
import { simpleTag } from './expression.js';
import { InputParameter } from './parameter.js';

export class EnvironmentVariable {
    readonly name: string;
    value?: string;
    valueFrom?: IoK8SApiCoreV1EnvVarSource;
    valueFromInputParameter?: InputParameter;
    constructor(name: string, init: Partial<EnvironmentVariable>) {
        this.name = name;

        Object.assign(this, init);
    }

    toEnvironmentVariable(): IoK8SApiCoreV1EnvVar {
        this.validateMutuallyExclusive();

        let value = this.value;

        if (this.valueFromInputParameter) {
            value = simpleTag(this.valueFromInputParameter);
        }

        return {
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

        if (count !== 1) {
            throw new Error(
                `Exactly one of value, valueFrom, or valueFromInputParameter must be specified on environment variable ${this.name}`,
            );
        }
    }
}
