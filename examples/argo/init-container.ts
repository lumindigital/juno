import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { UserContainer } from '../../src/api/user-container';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const initContainerExampleTemplate = new Template('init-container-example', {
        container: new Container({
            command: ['echo', 'bye'],
            image: 'alpine:latest',
            volumeMounts: [
                {
                    mountPath: '/foo',
                    name: 'foo',
                },
            ],
        }),
        initContainers: [
            new UserContainer('hello', {
                command: ['echo', 'hello'],
                image: 'alpine:latest',
                mirrorVolumeMounts: true,
                name: 'hello',
            }),
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'init-container-',
        },
        spec: new WorkflowSpec({
            entrypoint: initContainerExampleTemplate,
            volumes: [
                {
                    emptyDir: {},
                    name: 'foo',
                },
            ],
        }),
    }).toWorkflow();
}
