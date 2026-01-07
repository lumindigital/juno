import { simpleTag } from '../../src/api/expressions/tag';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        resource: {
            action: 'patch',
            flags: ['pod', `${simpleTag({ string: 'pod.name' })}`],
            manifest: `metadata:
  annotations:
    foo: bar
`,
            mergeStrategy: 'merge',
        },
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': 'This example shows a more advanced JSON merge patch\n',
            },
            generateName: 'k8s-patch-merge-pod-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
