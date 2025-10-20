import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const k8sSetOwnerReferenceTemplate = new Template('k8s-set-owner-reference', {
        resource: {
            action: 'create',
            manifest: `apiVersion: v1
kind: ConfigMap
metadata:
  generateName: owned-eg-
data:
  some: value
`,
            setOwnerReference: true,
        },
    });

    return new Workflow({
        metadata: {
            generateName: 'k8s-set-owner-reference-',
        },
        spec: new WorkflowSpec({
            entrypoint: k8sSetOwnerReferenceTemplate,
        }),
    }).toWorkflow();
}
