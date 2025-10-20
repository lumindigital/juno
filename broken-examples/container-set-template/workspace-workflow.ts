import { OutputArtifact } from '../../src/api/artifact';
import { ContainerSetTemplate } from '../../src/api/container-set-template';
import { Outputs } from '../../src/api/outputs';
import { OutputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        containerSet: new ContainerSetTemplate({
            containers: [
                {
                    args: ['echo', 'hi', '/workspace/out'],
                    image: 'argoproj/argosay:v2',
                    name: 'a',
                },
                {
                    image: 'argoproj/argosay:v2',
                    name: 'main',
                },
            ],
            volumeMounts: [
                {
                    mountPath: '/workspace',
                    name: 'workspace',
                },
            ],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('out', {
                    path: '/workspace/out',
                }),
            ],
            parameters: [
                new OutputParameter('out', {
                    valueFrom: {
                        path: '/workspace/out',
                    },
                }),
            ],
        }),
        volumes: [
            {
                emptyDir: {},
                name: 'workspace',
            },
        ],
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This workflow demonstrates using a workspace to share files between containers. This also allows containers not\ncalled "main" to create output artifacts.\n',
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'workspace-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
