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

    const exitContainerTemplate = new Template('exitContainer', {
        container: new Container({
            args: ['goodbye world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    const stepTemplate = new Template('step-template', {
        steps: [
            [
                new WorkflowStep('stepA', {
                    onExit: exitContainerTemplate,
                    template: helloWorldTemplate,
                }),
            ],
            [
                new WorkflowStep('stepB', {
                    onExit: exitContainerTemplate,
                    template: helloWorldTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'container-on-exit-',
        },
        spec: new WorkflowSpec({
            entrypoint: stepTemplate,
        }),
    }).toWorkflow();
}
