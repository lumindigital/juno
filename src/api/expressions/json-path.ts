import { ExpressionArgs } from '../expressions/types.js';
import { JsonCastExpression, JsonPathExpression } from './classes.js';
import { hyphenateExpressionArgs } from './tag.js';
export class WorkflowParametersJson {
    isWorkflowParametersJson = true;

    toString() {
        return 'workflow.parameters.json';
    }
}

export class WorkflowAnnotationsJson {
    isWorkflowAnnotationsJson = true;

    toString() {
        return 'workflow.annotations.json';
    }
}

export class WorkflowLabelsJson {
    isWorkflowLabelsJson = true;

    toString() {
        return 'workflow.labels.json';
    }
}

export class CronWorkflowAnnotationsJson {
    isCronWorkflowAnnotationsJson = true;

    toString() {
        return 'cronworkflow.annotations.json';
    }
}

export class CronWorkflowLabelsJson {
    isCronWorkflowLabelsJson = true;

    toString() {
        return 'cronworkflow.labels.json';
    }
}

export function jsonPath(
    input:
        | ExpressionArgs
        | WorkflowParametersJson
        | WorkflowAnnotationsJson
        | WorkflowLabelsJson
        | CronWorkflowAnnotationsJson
        | CronWorkflowLabelsJson
        | JsonCastExpression,
    value: string,
): JsonPathExpression {
    if ((input as WorkflowParametersJson)?.isWorkflowParametersJson) {
        return new JsonPathExpression(`jsonpath(${input}, '${value}')`);
    } else if ((input as WorkflowAnnotationsJson)?.isWorkflowAnnotationsJson) {
        return new JsonPathExpression(`jsonpath(${input}, '${value}')`);
    } else if ((input as WorkflowLabelsJson)?.isWorkflowLabelsJson) {
        return new JsonPathExpression(`jsonpath(${input}, '${value}')`);
    } else if ((input as CronWorkflowAnnotationsJson)?.isCronWorkflowAnnotationsJson) {
        return new JsonPathExpression(`jsonpath(${input}, '${value}')`);
    } else if ((input as CronWorkflowLabelsJson)?.isCronWorkflowLabelsJson) {
        return new JsonPathExpression(`jsonpath(${input}, '${value}')`);
    } else if ((input as JsonCastExpression)?.isJsonCastExpression) {
        return new JsonPathExpression(`jsonpath(${input}, '${value}')`);
    } else {
        return new JsonPathExpression(`jsonpath(${hyphenateExpressionArgs(input as ExpressionArgs)}, '${value}')`);
    }
}
