import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    const intentionalFailTemplate = new Template('intentional-fail', {
        container: new Container({
            args: ['echo intentional failure; exit 1'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
    });

    const workflowIgnoreTemplate = new Template('workflow-ignore', {
        steps: [
            [
                new WorkflowStep('A', {
                    template: helloWorldTemplate,
                }),
            ],
            [
                new WorkflowStep('B', {
                    template: helloWorldTemplate,
                }),
                new WorkflowStep('C', {
                    continueOn: {
                        failed: true,
                    },
                    template: intentionalFailTemplate,
                }),
            ],
            [
                new WorkflowStep('D', {
                    template: helloWorldTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'continue-on-fail-',
        },
        spec: new WorkflowSpec({
            entrypoint: workflowIgnoreTemplate,
            parallelism: 1,
        }),
    }).toWorkflow();
}
