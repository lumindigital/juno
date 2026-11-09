import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { UserContainer } from '../../src/api/user-container';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    // Uses the workflow-level podResources.
    const smallTemplate = new Template('small', {
        container: new Container({
            args: ['small step'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    // Replaces the workflow-level podResources for this template's pod, which is shared by the main container and its sidecar.
    const largeTemplate = new Template('large', {
        container: new Container({
            args: ['sleep 5; echo large step'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        podResources: {
            limits: {
                cpu: '2',
                memory: '1Gi',
            },
        },
        sidecars: [
            new UserContainer('helper', {
                args: ['sleep 10'],
                command: ['sh', '-c'],
                image: 'busybox',
            }),
        ],
    });

    const mainTemplate = new Template('main', {
        steps: [
            [new WorkflowStep('small', { template: smallTemplate })],
            [new WorkflowStep('large', { template: largeTemplate })],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'pod-resources-template-override-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
            podResources: {
                limits: {
                    cpu: '1',
                    memory: '512Mi',
                },
            },
        }),
    }).toWorkflow();
}
