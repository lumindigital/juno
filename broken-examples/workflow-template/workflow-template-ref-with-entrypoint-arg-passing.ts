import { WorkflowArguments } from '../../src/api/arguments';
import { WorkflowParameter } from '../../src/api/parameter';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowTemplateReference } from '../../src/api/workflow-template-reference';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    return new Workflow({
        metadata: {
            generateName: 'workflow-template-hello-world-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [new WorkflowParameter('message', { value: 'hello world' })],
            }),
            //entrypoint: 'print-message',
            workflowTemplateRef: new WorkflowTemplateReference({
                //name: 'workflow-template-print-message',
            }),
        }),
    }).toWorkflow();
}
