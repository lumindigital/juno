import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expressions/tag';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const flakeyContainerTemplate = new Template('flakey-container', {
        container: new Container({
            args: ['exit 1'],
            command: ['sh', '-c'],
            image: 'alpine:3.6',
        }),
    });

    const failedTemplate = new Template('failed', {
        container: new Container({
            args: ['echo "the flakey container failed"'],
            command: ['sh', '-c'],
            image: 'alpine:3.6',
        }),
    });

    const succeededTemplate = new Template('succeeded', {
        container: new Container({
            args: ['echo "the flakey container passed"'],
            command: ['sh', '-c'],
            image: 'alpine:3.6',
        }),
    });

    const flakeyContainerStep = new WorkflowStep('flakey-container', {
        continueOn: {
            failed: true,
        },
        template: flakeyContainerTemplate,
    });

    const statusReferenceTemplate = new Template('status-reference', {
        steps: [
            [flakeyContainerStep],
            [
                new WorkflowStep('failed', {
                    template: failedTemplate,
                    when: `${simpleTag({ workflowStep: flakeyContainerStep, output: 'status' })} == Failed`,
                }),
                new WorkflowStep('succeeded', {
                    template: succeededTemplate,
                    when: `${simpleTag({ workflowStep: flakeyContainerStep, output: 'status' })} == Succeeded`,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'status-reference-',
        },
        spec: new WorkflowSpec({
            entrypoint: statusReferenceTemplate,
        }),
    }).toWorkflow();
}
