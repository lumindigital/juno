import { ClusterWorkflowTemplates } from '../../example-helpers/cluster-workflow-templates';
import { SharedTemplates } from '../../example-helpers/shared-templates';
import { WorkflowArguments } from '../../src/api/arguments';
import { WorkflowParameter } from '../../src/api/parameter';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowTemplateReference } from '../../src/api/workflow-template-reference';
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
            entrypoint: SharedTemplates.printMessageTemplate,
            workflowTemplateRef: new WorkflowTemplateReference({
                workflowTemplate: ClusterWorkflowTemplates.printMessageClusterWorkflowTemplate,
            }),
        }),
    }).toWorkflow();
}
