import { WorkflowArguments } from '../../src/api/arguments';
import { WorkflowParameter } from '../../src/api/parameter';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    return new Workflow({
        metadata: {
            generateName: 'cluster-workflow-template-hello-world-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [new WorkflowParameter('message', { value: 'hello world' })],
            }),
            entrypoint: 'print-message',
            workflowTemplateRef: {
                clusterScope: true,
                name: 'cluster-workflow-template-print-message',
            },
        }),
    }).toWorkflow();
}
