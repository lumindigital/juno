import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const intentionalFailTemplate = new Template('intentional-fail', {
        container: new Container({
            args: ['echo intentional failure; exit 1'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
    });

    const sendEmailTemplate = new Template('send-email', {
        container: new Container({
            args: [
                `echo send e-mail: ${simpleTag('workflow.name')} ${simpleTag('workflow.status')} ${simpleTag('workflow.duration')}. Failed steps ${simpleTag('workflow.failures')}`,
            ],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
    });

    const celebrateTemplate = new Template('celebrate', {
        container: new Container({
            args: ['echo hooray!'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
    });

    const cryTemplate = new Template('cry', {
        container: new Container({
            args: ['echo boohoo!'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
    });

    const exitHandlerTemplate = new Template('exit-handler', {
        steps: [
            [
                new WorkflowStep('notify', {
                    template: sendEmailTemplate,
                }),
                new WorkflowStep('celebrate', {
                    template: celebrateTemplate,
                    when: `${simpleTag('workflow.status')} == Succeeded`,
                }),
                new WorkflowStep('cry', {
                    template: cryTemplate,
                    when: `${simpleTag('workflow.status')} != Succeeded`,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'exit-handlers-',
        },
        spec: new WorkflowSpec({
            entrypoint: intentionalFailTemplate,
            onExit: exitHandlerTemplate,
        }),
    }).toWorkflow();
}
