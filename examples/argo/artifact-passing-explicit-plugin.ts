import { Arguments } from '../../src/api/arguments';
import { InputArtifact, OutputArtifact } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { Outputs } from '../../src/api/outputs';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputArtifact = new InputArtifact('message', {
        path: '/tmp/message',
    });

    const helloArtOutputArtifact = new OutputArtifact('hello-art', {
        path: '/tmp/hello_world.txt',
        // Stores the artifact with the artifact driver plugin named "test".
        plugin: {
            configuration: `bucket: my-bucket
endpoint: minio:9000
insecure: true
accessKeySecret:
  name: my-minio-cred
  key: accesskey
secretKeySecret:
  name: my-minio-cred
  key: secretkey
`,
            key: 'hi',
            name: 'test',
        },
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

    const printMessageFromFileTemplate = new Template('print-message-from-file', {
        container: new Container({
            args: ['cat /tmp/message'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            artifacts: [messageInputArtifact],
        }),
    });

    const generateStep = new WorkflowStep('generate-artifact', {
        template: helloWorldToFileTemplate,
    });

    const artifactExampleTemplate = new Template('artifact-example', {
        steps: [
            [generateStep],
            [
                new WorkflowStep('consume-artifact', {
                    arguments: new Arguments({
                        artifacts: [
                            messageInputArtifact.toArgumentArtifact({
                                valueFromExpressionArgs: {
                                    output: helloArtOutputArtifact,
                                    workflowStep: generateStep,
                                },
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
            generateName: 'artifact-passing-',
        },
        spec: new WorkflowSpec({
            entrypoint: artifactExampleTemplate,
        }),
    }).toWorkflow();
}
