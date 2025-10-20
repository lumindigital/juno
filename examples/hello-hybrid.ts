import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWinTemplate = new Template('hello-win', {
        container: new Container({
            args: ['echo', 'Hello from Windows Container!'],
            command: ['cmd', '/c'],
            image: 'mcr.microsoft.com/windows/nanoserver:1809',
        }),
        nodeSelector: {
            'kubernetes.io/os': 'windows',
        },
    });

    const helloLinuxTemplate = new Template('hello-linux', {
        container: new Container({
            args: ['Hello from Linux Container!'],
            command: ['echo'],
            image: 'alpine',
        }),
        nodeSelector: {
            'kubernetes.io/os': 'linux',
        },
    });

    const mytemplateTemplate = new Template('mytemplate', {
        steps: [
            [
                new WorkflowStep('step1', {
                    template: helloWinTemplate,
                }),
            ],
            [
                new WorkflowStep('step2', {
                    template: helloLinuxTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'hello-hybrid-',
        },
        spec: new WorkflowSpec({
            entrypoint: mytemplateTemplate,
        }),
    }).toWorkflow();
}
