import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloOutputParam = new OutputParameter('hello-param', {
        valueFrom: {
            default: 'Foobar',
            path: '/tmp/hello_world.txt',
        },
    });

    const helloWorldToFileTemplate = new Template('hello-world-to-file', {
        container: new Container({
            args: ['sleep 1; echo -n hello world > /tmp/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        outputs: new Outputs({
            parameters: [helloOutputParam],
        }),
    });

    const printMessageInputMessageParam = new InputParameter('message');
    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: [simpleTag(printMessageInputMessageParam)],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [printMessageInputMessageParam],
        }),
    });

    const generateParameter = new WorkflowStep('generate-parameter', {
        template: helloWorldToFileTemplate,
    });

    const outputParameter = new Template('output-parameter', {
        steps: [
            [generateParameter],
            [
                new WorkflowStep('consume-parameter', {
                    template: printMessageTemplate,
                    arguments: new Arguments({
                        parameters: [
                            printMessageInputMessageParam.toArgumentParameter({
                                valueFromOutputParameter: {
                                    task: generateParameter,
                                    parameter: helloOutputParam,
                                },
                            }),
                        ],
                    }),
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'output-parameter-',
        },
        spec: new WorkflowSpec({
            entrypoint: outputParameter,
        }),
    }).toWorkflow();
}
