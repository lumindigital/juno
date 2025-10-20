import { InputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const inputArtifactS3ExampleTemplate = new Template('input-artifact-s3-example', {
        container: new Container({
            args: ['ls -l /my-artifact'],
            command: ['sh', '-c'],
            image: 'debian:latest',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('my-art', {
                    azure: {
                        accountKeySecret: {
                            key: 'accountKey',
                            name: 'my-azure-credentials',
                        },
                        blob: 'path/in/container',
                        container: 'my-container',
                        endpoint: 'https://myazurestorageaccountname.blob.core.windows.net',
                    },
                    path: '/my-artifact',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'input-artifact-s3-',
        },
        spec: new WorkflowSpec({
            entrypoint: inputArtifactS3ExampleTemplate,
        }),
    }).toWorkflow();
}
