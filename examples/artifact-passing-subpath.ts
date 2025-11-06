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
    const helloArtOutputArtifact = new OutputArtifact('hello-art', {
        archive: {
            none: {},
        },
        path: '/tmp/',
    });

    const helloWorldToFileTemplate = new Template('hello-world-to-file', {
        container: new Container({
            args: ['sleep 1; echo hello world | tee /tmp/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        outputs: new Outputs({
            artifacts: [helloArtOutputArtifact],
        }),
    });

    const messageInputArtifact = new InputArtifact('message');

    const printMessageDirTemplate = new Template('print-message-dir', {
        container: new Container({
            args: ['ls /tmp/message'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('message', {
                    path: '/tmp/message',
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
            artifacts: [
                new InputArtifact('message', {
                    path: '/tmp/message',
                }),
            ],
        }),
    });

    const generateArtifactStep = new WorkflowStep('generate-artifact', {
        template: helloWorldToFileTemplate,
    });

    const artifactExampleTemplate = new Template('artifact-example', {
        steps: [
            [generateArtifactStep],
            [
                new WorkflowStep('list-artifact', {
                    arguments: new Arguments({
                        artifacts: [
                            messageInputArtifact.toArgumentArtifact({
                                fromOutputArtifact: { task: generateArtifactStep, parameter: helloArtOutputArtifact },
                            }),
                        ],
                    }),
                    template: printMessageDirTemplate,
                }),
            ],
            [
                new WorkflowStep('consume-artifact', {
                    arguments: new Arguments({
                        artifacts: [
                            messageInputArtifact.toArgumentArtifact({
                                fromOutputArtifact: { task: generateArtifactStep, parameter: helloArtOutputArtifact },
                                subPath: 'hello_world.txt',
                            }),
                        ],
                    }),
                    template: printMessageFromFileTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'artifact-passing-subpath-',
        },
        spec: new WorkflowSpec({
            entrypoint: artifactExampleTemplate,
        }),
    }).toWorkflow();
}
