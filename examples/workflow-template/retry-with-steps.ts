import {
    randomFailTemplate,
    workflowTemplateRandomFail as randomFailWorkflowTemplate,
} from '../../example-helpers/workflow-templates';
import { Template } from '../../src/api/template';
import { TemplateReference } from '../../src/api/template-reference';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const retryWithStepsTemplate = new Template('retry-with-steps', {
        steps: [
            [
                new WorkflowStep('hello1', {
                    templateRef: new TemplateReference({
                        template: randomFailTemplate,
                        workflowTemplate: randomFailWorkflowTemplate,
                    }),
                }),
            ],
            [
                new WorkflowStep('hello2a', {
                    templateRef: new TemplateReference({
                        template: randomFailTemplate,
                        workflowTemplate: randomFailWorkflowTemplate,
                    }),
                }),
                new WorkflowStep('hello2b', {
                    templateRef: new TemplateReference({
                        template: randomFailTemplate,
                        workflowTemplate: randomFailWorkflowTemplate,
                    }),
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'workflow-template-retry-with-steps-',
        },
        spec: new WorkflowSpec({
            entrypoint: retryWithStepsTemplate,
        }),
    }).toWorkflow();
}
