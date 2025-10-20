import { Arguments } from '../src/api/arguments';
import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputArtifact = new InputArtifact('message', {
        path: '/tmp/message',
    });

    const helloWorldToFileTemplate = new Template('hello-world-to-file', {
        container: new Container({
            args: ['sleep 1; echo hello world | tee /tmp/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('hello-art', {
                    path: '/tmp/hello_world.txt',
                }),
            ],
        }),
    });

    const printMessageFromFileTemplate = new Template('print-message-from-file', {
        container: new Container({
            args: ['cat /tmp/message'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            artifacts: [messageInputArtifact],
        }),
    });

    const artifactTemplateExample = new Template('artifact-example', {
        steps: [],
    });

    const generateStep = new WorkflowStep('generate-artifact', {
        template: helloWorldToFileTemplate,
    });

    artifactTemplateExample.steps?.push(
        [generateStep],
        [
            new WorkflowStep('consume-artifact', {
                arguments: new Arguments({
                    artifacts: [
                        messageInputArtifact.toArgumentArtifact({
                            fromOutputArtifact: {
                                parameter: helloWorldToFileTemplate?.outputs?.artifacts?.[0] as OutputArtifact,
                                task: generateStep,
                            },
                        }),
                    ],
                }),
                template: printMessageFromFileTemplate,
            }),
        ],
    );

    return new Workflow({
        metadata: {
            generateName: 'artifact-passing-',
        },
        spec: new WorkflowSpec({
            entrypoint: artifactTemplateExample,
        }),
    }).toWorkflow();
}
