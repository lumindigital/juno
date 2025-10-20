import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const genRandomIntTemplate = new Template('gen-random-int', {
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import random
i = random.randint(1, 100)
print(i)
`,
        }),
    });

    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: ['echo result was: ' + simpleTag(messageInputParameter)],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const pythonScriptExampleTemplate = new Template('python-script-example', {
        steps: [
            [
                new WorkflowStep('generate', {
                    template: genRandomIntTemplate,
                }),
            ],
            [
                new WorkflowStep('print', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({ value: '{{steps.generate.outputs.result}}' }),
                        ],
                    }),
                    template: printMessageTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'scripts-python-',
        },
        spec: new WorkflowSpec({
            entrypoint: pythonScriptExampleTemplate,
        }),
    }).toWorkflow();
}
