import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const retryWithStepsTemplate = new Template('retry-with-steps', {
        steps: [
            [
                new WorkflowStep('hello1', {
                    // templateRef: new TemplateReference({
                    //     name: 'workflow-template-random-fail-template',
                    //     template: 'random-fail-template',
                    // }),
                }),
            ],
            [
                new WorkflowStep('hello2a', {
                    // templateRef: new TemplateReference({
                    //     name: 'workflow-template-random-fail-template',
                    //     template: 'random-fail-template',
                    // }),
                }),
                new WorkflowStep('hello2b', {
                    // templateRef: new TemplateReference({
                    //     name: 'workflow-template-random-fail-template',
                    //     template: 'random-fail-template',
                    // }),
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
