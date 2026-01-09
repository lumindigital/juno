import { InputArtifact } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const inputArtifactGcsExampleTemplate = new Template('input-artifact-gcs-example', {
        container: new Container({
            args: ['ls -l /my-artifact'],
            command: ['sh', '-c'],
            image: 'debian:latest',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('my-art', {
                    gcs: {
                        bucket: 'my-bucket-name',
                        key: 'path/in/bucket',
                        serviceAccountKeySecret: {
                            key: 'serviceAccountKey',
                            name: 'my-gcs-credentials',
                        },
                    },
                    path: '/my-artifact',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'input-artifact-gcs-',
        },
        spec: new WorkflowSpec({
            entrypoint: inputArtifactGcsExampleTemplate,
        }),
    }).toWorkflow();
}
