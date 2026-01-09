import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

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

    return new Workflow({
        metadata: {
            generateName: 'hello-windows-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWinTemplate,
        }),
    }).toWorkflow();
}
