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
    const helloArtArtifact = new OutputArtifact('hello-art', {
        artifactory: {
            passwordSecret: {
                key: 'password',
                name: 'my-artifactory-credentials',
            },
            url: 'http://artifactory:8081/artifactory/generic-local/hello_world.tgz',
            usernameSecret: {
                key: 'username',
                name: 'my-artifactory-credentials',
            },
        },
        path: '/tmp/hello_world.txt',
    });

    const helloWorldToFileTemplate = new Template('hello-world-to-file', {
        container: new Container({
            args: ['echo hello world | tee /tmp/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        outputs: new Outputs({
            artifacts: [helloArtArtifact],
        }),
    });

    const messageInputArtifact = new InputArtifact('message', {
        artifactory: {
            passwordSecret: {
                key: 'password',
                name: 'my-artifactory-credentials',
            },
            url: 'http://artifactory:8081/artifactory/generic-local/hello_world.tgz',
            usernameSecret: {
                key: 'username',
                name: 'my-artifactory-credentials',
            },
        },
        path: '/tmp/message',
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

    const generateArtifactStep = new WorkflowStep('generate-artifact', {
        template: helloWorldToFileTemplate,
    });

    const artifactExampleTemplate = new Template('artifact-example', {
        steps: [
            [generateArtifactStep],
            [
                new WorkflowStep('consume-artifact', {
                    arguments: new Arguments({
                        artifacts: [
                            messageInputArtifact.toArgumentArtifact({
                                fromOutputArtifact: { task: generateArtifactStep, parameter: helloArtArtifact },
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
            generateName: 'artifactory-artifact-',
        },
        spec: new WorkflowSpec({
            entrypoint: artifactExampleTemplate,
        }),
    }).toWorkflow();
}
