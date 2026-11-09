import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const showDevicesTemplate = new Template('show-devices', {
        container: new Container({
            args: ['echo using the allocated device'],
            command: ['sh', '-c'],
            image: 'busybox',
            // A container only sees a claim it asks for by name.
            resources: {
                claims: [{ name: 'accelerator' }],
            },
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'resource-claims-',
            labels: {
                'workflows.argoproj.io/no-test': 'environment',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: showDevicesTemplate,
            // Applies to every pod that runs a template, unless that template sets its own resourceClaims.
            resourceClaims: [
                {
                    name: 'accelerator',
                    resourceClaimTemplateName: 'example-device-claim-template',
                },
            ],
        }),
    }).toWorkflow();
}
