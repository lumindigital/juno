import { ClusterWorkflowTemplates } from '../../../example-helpers/cluster-workflow-templates';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { WorkflowTemplateReference } from '../../../src/api/workflow-template-reference';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    return new Workflow({
        metadata: {
            generateName: 'cluster-workflow-template-hello-world-',
        },
        spec: new WorkflowSpec({
            workflowTemplateRef: new WorkflowTemplateReference({
                workflowTemplate: ClusterWorkflowTemplates.submittableClusterWorkflowTemplate,
            }),
        }),
    }).toWorkflow();
}
