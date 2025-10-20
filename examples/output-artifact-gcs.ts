import { OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Outputs } from '../src/api/outputs';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldToFileTemplate = new Template('hello-world-to-file', {
        container: new Container({
            args: ['echo hello world | tee /tmp/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('message', {
                    gcs: {
                        bucket: 'my-bucket',
                        key: 'path/in/bucket/hello_world.txt.tgz',
                        serviceAccountKeySecret: {
                            key: 'serviceAccountKey',
                            name: 'my-gcs-credentials',
                        },
                    },
                    path: '/tmp',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'output-artifact-gcs-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldToFileTemplate,
        }),
    }).toWorkflow();
}
