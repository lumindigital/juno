import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: [simpleTag(messageInputParameter)],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const loopExampleTemplate = new Template('loop-example', {
        steps: [
            [
                new WorkflowStep('print-message-loop', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    template: printMessageTemplate,
                    withItems: ['hello world', 'goodbye world'],
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'loops-',
        },
        spec: new WorkflowSpec({
            entrypoint: loopExampleTemplate,
        }),
    }).toWorkflow();
}
