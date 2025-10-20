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
                    path: '/tmp',
                    s3: {
                        accessKeySecret: {
                            key: 'accessKey',
                            name: 'my-s3-credentials',
                        },
                        bucket: 'my-bucket',
                        endpoint: 's3.amazonaws.com',
                        key: 'path/in/bucket/hello_world.txt.tgz',
                        region: 'us-west-2',
                        secretKeySecret: {
                            key: 'secretKey',
                            name: 'my-s3-credentials',
                        },
                    },
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'output-artifact-s3-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldToFileTemplate,
        }),
    }).toWorkflow();
}
