import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    const approveTemplate = new Template('approve', {
        suspend: {},
    });

    const delayTemplate = new Template('delay', {
        suspend: {
            duration: '20',
        },
    });

    const suspendTemplate = new Template('suspend', {
        steps: [
            [
                new WorkflowStep('build', {
                    template: helloWorldTemplate,
                }),
            ],
            [
                new WorkflowStep('approve', {
                    template: approveTemplate,
                }),
            ],
            [
                new WorkflowStep('delay', {
                    template: delayTemplate,
                }),
            ],
            [
                new WorkflowStep('release', {
                    template: helloWorldTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'suspend-template-',
        },
        spec: new WorkflowSpec({
            entrypoint: suspendTemplate,
        }),
    }).toWorkflow();
}
