import { expect } from 'chai';
import {
    CronWorkflowAnnotationsJson,
    CronWorkflowLabelsJson,
    jsonPath,
    WorkflowAnnotationsJson,
    WorkflowLabelsJson,
    WorkflowParametersJson,
} from '../../../src/api/expressions/json-path';
import { DagTask } from '../../../src/api/dag-task';
import { OutputParameter } from '../../../src/api/parameter';

describe('jsonPath tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };

    describe('jsonPath', (): void => {
        it('returns successfully when given an expression argument', (): void => {
            const result = jsonPath(expressionArg, '$[0].value');
            expect(result.toString()).to.equal(`jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$[0].value')`);
        });

        it('returns successfully when given WorkflowParametersJson', (): void => {
            const result = jsonPath(new WorkflowParametersJson(), '$.myParam');
            expect(result.toString()).to.equal(`jsonpath(workflow.parameters.json, '$.myParam')`);
        });

        it('returns successfully when given WorkflowAnnotationsJson', (): void => {
            const result = jsonPath(new WorkflowAnnotationsJson(), '$.myAnnotation');
            expect(result.toString()).to.equal(`jsonpath(workflow.annotations.json, '$.myAnnotation')`);
        });

        it('returns successfully when given WorkflowLabelsJson', (): void => {
            const result = jsonPath(new WorkflowLabelsJson(), '$.myLabel');
            expect(result.toString()).to.equal(`jsonpath(workflow.labels.json, '$.myLabel')`);
        });

        it('returns successfully when given CronWorkflowAnnotationsJson', (): void => {
            const result = jsonPath(new CronWorkflowAnnotationsJson(), '$.myCronAnnotation');
            expect(result.toString()).to.equal(`jsonpath(cronworkflow.annotations.json, '$.myCronAnnotation')`);
        });

        it('returns successfully when given CronWorkflowLabelsJson', (): void => {
            const result = jsonPath(new CronWorkflowLabelsJson(), '$.myCronLabel');
            expect(result.toString()).to.equal(`jsonpath(cronworkflow.labels.json, '$.myCronLabel')`);
        });
    });
});
