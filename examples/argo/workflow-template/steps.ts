import { Arguments } from '../../../src/api/arguments';
import { InputParameter } from '../../../src/api/parameter';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { WorkflowStep } from '../../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';
import { TemplateReference } from '../../../src/api/template-reference';
import { SharedTemplates } from '../../../example-helpers/shared-templates';
import { WorkflowTemplates } from '../../../example-helpers/workflow-templates';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const helloHelloHelloTemplate = new Template('hello-hello-hello', {
        steps: [
            [
                new WorkflowStep('hello1', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'hello1' })],
                    }),
                    templateRef: new TemplateReference({
                        workflowTemplate: SharedTemplates.printMessageWorkflowTemplate,
                        template: SharedTemplates.printMessageTemplate,
                    }),
                }),
            ],
            [
                new WorkflowStep('hello2a', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'hello2a' })],
                    }),
                    templateRef: new TemplateReference({
                        template: SharedTemplates.innerStepsTemplate,
                        workflowTemplate: WorkflowTemplates.innerStepsWorkflowTemplate,
                    }),
                }),
                new WorkflowStep('hello2b', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'hello2b' })],
                    }),
                    templateRef: new TemplateReference({
                        workflowTemplate: SharedTemplates.printMessageWorkflowTemplate,
                        template: SharedTemplates.printMessageTemplate,
                    }),
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'workflow-template-steps-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloHelloHelloTemplate,
        }),
    }).toWorkflow();
}
