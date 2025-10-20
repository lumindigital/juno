import { InputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const inputArtifactOssExampleTemplate = new Template('input-artifact-oss-example', {
        container: new Container({
            args: ['ls -l /my-artifact'],
            command: ['sh', '-c'],
            image: 'debian:latest',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('my-art', {
                    oss: {
                        accessKeySecret: {
                            key: 'accessKey',
                            name: 'my-oss-credentials',
                        },
                        bucket: 'test-bucket-name',
                        endpoint: 'http://oss-cn-hangzhou-zmf.aliyuncs.com',
                        key: 'test/mydirectory/',
                        secretKeySecret: {
                            key: 'secretKey',
                            name: 'my-oss-credentials',
                        },
                    },
                    path: '/my-artifact',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'input-artifact-oss-',
        },
        spec: new WorkflowSpec({
            entrypoint: inputArtifactOssExampleTemplate,
        }),
    }).toWorkflow();
}
