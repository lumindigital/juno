import {
    IoK8SApiCoreV1ConfigMapKeySelector,
    IoArgoprojWorkflowV1Alpha1SuppliedValueFrom,
    IoArgoprojWorkflowV1Alpha1ValueFrom,
} from '../workflow-interfaces/data-contracts.js';
import { ExpressionTemplateInputs, CastExpressions, JsonPathExpression } from './expressions/classes.js';

export class ParameterValueFrom {
    configMapKeyRef?: IoK8SApiCoreV1ConfigMapKeySelector;
    default?: string;
    event?: string;
    expression?: string;
    expressionFrom?: ExpressionTemplateInputs | CastExpressions | JsonPathExpression;
    jqFilter?: string;
    jsonPath?: string;
    parameter?: string;
    path?: string;
    supplied?: IoArgoprojWorkflowV1Alpha1SuppliedValueFrom;

    constructor(init?: Partial<ParameterValueFrom>) {
        Object.assign(this, init);
    }

    toValueFrom(templateName: string, parameterName: string): IoArgoprojWorkflowV1Alpha1ValueFrom {
        this.validatesMutuallyExclusive(templateName, parameterName);

        const expression = this.expression ?? this.expressionFrom?.toString() ?? undefined;

        return {
            configMapKeyRef: this.configMapKeyRef,
            default: this.default,
            event: this.event,
            expression: expression,
            jqFilter: this.jqFilter,
            jsonPath: this.jsonPath,
            parameter: this.parameter,
            path: this.path,
            supplied: this.supplied,
        };
    }

    private validatesMutuallyExclusive(templateName: string, parameterName: string) {
        let count = 0;
        if (this.expression && this.expression !== '') {
            count++;
        }

        if (this.expressionFrom) {
            count++;
        }

        if (count > 1) {
            throw new Error(
                `Only one of expression or expressionFrom can be specified on ValueFrom defined on parameter ${parameterName} on ${templateName}`,
            );
        }
    }
}
