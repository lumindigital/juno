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
            generateName: 'pod-resources-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
            // Applies to all pods in the workflow, unless overridden at the template level.
            podResources: {
                limits: {
                    cpu: '1',
                    memory: '512Mi',
                },
                requests: {
                    cpu: '100m',
                    memory: '64Mi',
                },
            },
        }),
    }).toWorkflow();
}
