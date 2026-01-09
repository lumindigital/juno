import { OutputArtifact } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { Outputs } from '../../src/api/outputs';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        container: new Container({
            args: ['echo hello world | tee /tmp/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('hello_world', {
                    path: '/tmp/hello_world.txt',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'artifact-repository-ref-',
        },
        spec: new WorkflowSpec({
            artifactRepositoryRef: {
                key: 'my-key',
            },
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
