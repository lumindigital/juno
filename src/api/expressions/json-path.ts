import { ExpressionArgs } from '../expressions/types.js';
import { JsonPathExpression } from './classes.js';
import { getVariableReference } from './util.js';

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
        | CronWorkflowLabelsJson,
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
    } else {
        return new JsonPathExpression(`jsonpath(${getVariableReference(input as ExpressionArgs)}, '${value}')`);
    }
}
