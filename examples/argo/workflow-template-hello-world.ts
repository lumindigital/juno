import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1WorkflowTemplate } from '../../src/workflow-interfaces/data-contracts';
import { WorkflowTemplate } from '../../src/api/workflow-template';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1WorkflowTemplate> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new WorkflowTemplate({
        metadata: {
            name: 'hello-world',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
        }),
    }).toWorkflowTemplate();
}
