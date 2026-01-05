import { simpleTag } from '../../src/api/expression';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        resource: {
            action: 'patch',
            flags: ['workflow', simpleTag('workflow.name')],
            manifest: `- op: add
  path: /metadata/labels/foo
  value: bar
`,
            mergeStrategy: 'json',
        },
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This example shows how to patch a workflow with json mergeStrategy\n',
            },
            generateName: 'k8s-patch-json-workflow-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
