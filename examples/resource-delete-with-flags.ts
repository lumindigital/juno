import { Arguments } from '../src/api/arguments';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const selectorInputParameter = new InputParameter('selector');

    const createConfigMapTemplate = new Template('create-configmap', {
        resource: {
            action: 'create',
            manifest: `apiVersion: v1
kind: ConfigMap
metadata:
  name: resource-delete-with-flags
  labels:
    cleanup: "true"
data:
  key: value
`,
        },
    });

    const deleteResourceTemplate = new Template('delete-resource', {
        inputs: new Inputs({
            parameters: [selectorInputParameter],
        }),
        resource: {
            action: 'delete',
            flags: ['configmap', '--selector', `${simpleTag(selectorInputParameter)}`],
        },
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('submit-resource', {
                    template: createConfigMapTemplate,
                }),
            ],
            [
                new WorkflowStep('delete-resource', {
                    arguments: new Arguments({
                        parameters: [selectorInputParameter.toArgumentParameter({ value: 'cleanup=true' })],
                    }),
                    template: deleteResourceTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'resource-delete-with-flags-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
