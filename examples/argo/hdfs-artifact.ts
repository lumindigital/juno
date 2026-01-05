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
    const helloWorldOutputArtifact = new OutputArtifact('hello-art', {
        hdfs: {
            addresses: [
                'my-hdfs-namenode-0.my-hdfs-namenode.default.svc.cluster.local:8020',
                'my-hdfs-namenode-1.my-hdfs-namenode.default.svc.cluster.local:8020',
            ],
            force: true,
            hdfsUser: 'root',
            path: '/tmp/argo/foo',
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
            artifacts: [helloWorldOutputArtifact],
        }),
    });

    const messageInputArtifact = new InputArtifact('message', {
        hdfs: {
            addresses: [
                'my-hdfs-namenode-0.my-hdfs-namenode.default.svc.cluster.local:8020',
                'my-hdfs-namenode-1.my-hdfs-namenode.default.svc.cluster.local:8020',
            ],
            force: true,
            hdfsUser: 'root',
            path: '/tmp/argo/foo',
        },
        path: '/tmp/message',
    });

    const printMessageFromHdfsTemplate = new Template('print-message-from-hdfs', {
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
                                valueFromExpressionArgs: {
                                    workflowStep: generateArtifactStep,
                                    output: helloWorldOutputArtifact,
                                },
                            }),
                        ],
                    }),
                    template: printMessageFromHdfsTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'hdfs-artifact-',
        },
        spec: new WorkflowSpec({
            entrypoint: artifactExampleTemplate,
        }),
    }).toWorkflow();
}
