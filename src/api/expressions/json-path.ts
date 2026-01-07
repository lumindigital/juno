import { ExpressionArgs, getVariableReference } from '../expression.js';
import { JsonPathExpression } from './classes.js';

export class WorkflowParametersJson {
    isWorkflowParametersJson = true;
}

export class WorkflowAnnotationsJson {
    isWorkflowAnnotationsJson = true;
}

export class WorkflowLabelsJson {
    isWorkflowLabelsJson = true;
}

export class CronWorkflowAnnotationsJson {
    isCronWorkflowAnnotationsJson = true;
}

export class CronWorkflowLabelsJson {
    isCronWorkflowLabelsJson = true;
}

export function jsonPath(
    input:
        | ExpressionArgs
        | WorkflowParametersJson
        | WorkflowAnnotationsJson
        | WorkflowLabelsJson
        | CronWorkflowAnnotationsJson
        | CronWorkflowLabelsJson,
    value: string,
): JsonPathExpression {
    if ((input as WorkflowParametersJson)?.isWorkflowParametersJson) {
        return new JsonPathExpression(`jsonpath(workflow.parameters.json, '${value}')`);
    } else if ((input as WorkflowAnnotationsJson)?.isWorkflowAnnotationsJson) {
        return new JsonPathExpression(`jsonpath(workflow.annotations.json, '${value}')`);
    } else if ((input as WorkflowLabelsJson)?.isWorkflowLabelsJson) {
        return new JsonPathExpression(`jsonpath(workflow.labels.json, '${value}')`);
    } else if ((input as CronWorkflowAnnotationsJson)?.isCronWorkflowAnnotationsJson) {
        return new JsonPathExpression(`jsonpath(cronworkflow.annotations.json, '${value}')`);
    } else if ((input as CronWorkflowLabelsJson)?.isCronWorkflowLabelsJson) {
        return new JsonPathExpression(`jsonpath(cronworkflow.labels.json, '${value}')`);
    } else {
        return new JsonPathExpression(`jsonpath(${getVariableReference(input as ExpressionArgs)}, '${value}')`);
    }
}
