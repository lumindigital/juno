import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        resource: {
            action: 'patch',
            manifest: `apiVersion: v1
kind: Pod
metadata:
  name: {{pod.name}}
  annotations:
    foo: bar
`,
        },
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This example shows a standard patch with the default mergeStrategy (strategic)\n`,
            },
            generateName: 'k8s-patch-pod-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
