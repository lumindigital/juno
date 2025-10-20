import { Arguments } from '../../src/api/arguments';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { TemplateReference } from '../../src/api/template-reference';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const helloWorldFromTemplateRefTemplate = new Template('hello-world-from-templateRef', {
        steps: [
            [
                new WorkflowStep('call-print-message', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'hello world' })],
                    }),
                    templateRef: new TemplateReference({
                        // name: 'workflow-template-print-message',
                        template: new Template('print-message'),
                    }),
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'workflow-template-hello-world-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldFromTemplateRefTemplate,
        }),
    }).toWorkflow();
}
