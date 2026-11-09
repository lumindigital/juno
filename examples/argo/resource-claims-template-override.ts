import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    // Uses the workflow-level resourceClaims.
    const defaultDeviceTemplate = new Template('default-device', {
        container: new Container({
            args: ['using the workflow default device'],
            command: ['echo'],
            image: 'busybox',
            resources: {
                claims: [{ name: 'accelerator' }],
            },
        }),
    });

    // Replaces the workflow-level resourceClaims as a whole for this template's pod.
    const otherDeviceTemplate = new Template('other-device', {
        container: new Container({
            args: ['using a different device'],
            command: ['echo'],
            image: 'busybox',
            resources: {
                claims: [{ name: 'accelerator' }],
            },
        }),
        resourceClaims: [
            {
                name: 'accelerator',
                resourceClaimTemplateName: 'example-large-device-claim-template',
            },
        ],
    });

    const mainTemplate = new Template('main', {
        steps: [
            [new WorkflowStep('default-device', { template: defaultDeviceTemplate })],
            [new WorkflowStep('other-device', { template: otherDeviceTemplate })],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'resource-claims-template-override-',
            labels: {
                'workflows.argoproj.io/no-test': 'environment',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
            resourceClaims: [
                {
                    name: 'accelerator',
                    resourceClaimTemplateName: 'example-device-claim-template',
                },
            ],
        }),
    }).toWorkflow();
}
