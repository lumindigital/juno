import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `\`This is a simple hello world example.\`
This is an embedded link to the docs: https://argo-workflows.readthedocs.io/en/latest/title-and-description/
`,
                'workflows.argoproj.io/title': '**Test Title**',
            },
            generateName: 'title-and-description-with-markdown-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
        }),
    }).toWorkflow();
}
