import { OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Outputs } from '../src/api/outputs';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        container: new Container({
            args: ['echo "hello world" > /tmp/on-completion.txt\necho "hello world" > /tmp/on-deletion.txt\n'],
            command: ['sh', '-c'],
            image: 'argoproj/argosay:v2',
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('on-completion', {
                    artifactGC: {
                        strategy: 'OnWorkflowCompletion',
                    },
                    path: '/tmp/on-completion.txt',
                    s3: {
                        key: 'on-completion.txt',
                    },
                }),
                new OutputArtifact('on-deletion', {
                    path: '/tmp/on-deletion.txt',
                    s3: {
                        key: 'on-deletion.txt',
                    },
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'artifact-gc-',
        },
        spec: new WorkflowSpec({
            artifactGC: {
                strategy: 'OnWorkflowDeletion',
            },
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
