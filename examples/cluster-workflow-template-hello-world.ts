import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { ClusterWorkflowTemplate } from '../src/api/cluster-workflow-template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1ClusterWorkflowTemplate } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1ClusterWorkflowTemplate> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new ClusterWorkflowTemplate({
        metadata: {
            name: 'hello-world',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
        }),
    }).toClusterWorkflowTemplate();
}
