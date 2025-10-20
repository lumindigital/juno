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
    const helloWorldToFileTemplate = new Template('hello-world-to-file', {
        container: new Container({
            args: ['echo hello world | tee /tmp/hello_world.txt | tee /tmp/hello_world_nc.txt ; sleep 1'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('etc', {
                    archive: {
                        none: {},
                    },
                    path: '/etc',
                }),
                new OutputArtifact('hello-txt', {
                    archive: {
                        none: {},
                    },
                    path: '/tmp/hello_world.txt',
                }),
                new OutputArtifact('hello-txt-nc', {
                    archive: {
                        tar: {
                            compressionLevel: 0,
                        },
                    },
                    path: '/tmp/hello_world_nc.txt',
                }),
            ],
        }),
    });

    const etcInputArtifact = new InputArtifact('etc', {
        path: '/tmp/etc',
    });
    const helloTxtInputArtifact = new InputArtifact('hello-txt', {
        path: '/tmp/hello.txt',
    });
    const helloTxtNcInputArtifact = new InputArtifact('hello-txt-nc', {
        path: '/tmp/hello_nc.txt',
    });

    const printMessageFromFilesTemplate = new Template('print-message-from-files', {
        container: new Container({
            args: ['cat /tmp/hello.txt && cat /tmp/hello_nc.txt && cd /tmp/etc && find .'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            artifacts: [etcInputArtifact, helloTxtInputArtifact, helloTxtNcInputArtifact],
        }),
    });

    const generateArtifactStep = new WorkflowStep('generate-artifact', {
        template: helloWorldToFileTemplate,
    });

    const artifactDisableArchiveTemplate = new Template('artifact-disable-archive', {
        steps: [
            [generateArtifactStep],
            [
                new WorkflowStep('consume-artifact', {
                    arguments: new Arguments({
                        artifacts: [
                            etcInputArtifact.toArgumentArtifact({
                                from: '{{steps.generate-artifact.outputs.artifacts.etc}}',
                            }),
                            helloTxtInputArtifact.toArgumentArtifact({
                                from: '{{steps.generate-artifact.outputs.artifacts.hello-txt}}',
                            }),
                            helloTxtNcInputArtifact.toArgumentArtifact({
                                from: '{{steps.generate-artifact.outputs.artifacts.hello-txt-nc}}',
                            }),
                        ],
                    }),
                    template: printMessageFromFilesTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'artifact-disable-archive-',
        },
        spec: new WorkflowSpec({
            entrypoint: artifactDisableArchiveTemplate,
        }),
    }).toWorkflow();
}
