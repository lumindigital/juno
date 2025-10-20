import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        resource: {
            action: 'create',
            manifest: `apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: owned-eg-
spec:
  entrypoint: main
  templates:
    - name: main
      container:
        image: argoproj/argosay:v2
`,
            setOwnerReference: true,
        },
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This example creates a Kubernetes resource that will be deleted\nwhen the workflow is deleted via Kubernetes GC.\n\nA workflow is used for this example, but the same approach would apply\nto other resource types.\n\nhttps://kubernetes.io/docs/concepts/workloads/controllers/garbage-collection/\n',
            },
            generateName: 'k8s-owner-reference-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
