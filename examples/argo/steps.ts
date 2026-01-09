import { Arguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: [simpleTag(messageInputParameter).toString()],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const helloHelloHelloTemplate = new Template('hello-hello-hello', {
        steps: [
            [
                new WorkflowStep('hello1', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'hello1' })],
                    }),
                    template: printMessageTemplate,
                }),
            ],
            [
                new WorkflowStep('hello2a', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'hello2a' })],
                    }),
                    template: printMessageTemplate,
                }),
                new WorkflowStep('hello2b', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'hello2b' })],
                    }),
                    template: printMessageTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'steps-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloHelloHelloTemplate,
        }),
    }).toWorkflow();
}
