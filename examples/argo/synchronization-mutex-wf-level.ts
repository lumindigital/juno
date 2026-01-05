import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'synchronization-wf-level-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
            synchronization: {
                mutexes: [
                    {
                        name: 'test',
                    },
                ],
            },
        }),
    }).toWorkflow();
}
