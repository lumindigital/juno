import { Arguments } from '../src/api/arguments';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const createWfTemplate = new Template('create-wf', {
        outputs: new Outputs({
            parameters: [
                new OutputParameter('wf-name', {
                    valueFrom: {
                        jsonPath: '{.metadata.name}',
                    },
                }),
            ],
        }),
        resource: {
            action: 'create',
            manifest: `apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: sleep-
spec:
  entrypoint: sleep
  templates:
  - name: sleep
    container:
      image: alpine:latest
      command: [sleep, "20"]
`,
        },
    });

    const wfNameInputParameter = new InputParameter('wf-name');

    const waitWfTemplate = new Template('wait-wf', {
        inputs: new Inputs({
            parameters: [wfNameInputParameter],
        }),
        resource: {
            action: 'get',
            failureCondition: 'status.phase in (Failed, Error)',
            manifest: `apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  name: {{inputs.parameters.wf-name}}
`,
            successCondition: 'status.phase == Succeeded',
        },
    });

    const createWfStep = new WorkflowStep('create-wf', {
        template: createWfTemplate,
    });

    const k8sWaitWfTemplate = new Template('k8s-wait-wf', {
        steps: [
            [createWfStep],
            [
                new WorkflowStep('wait-wf', {
                    arguments: new Arguments({
                        parameters: [
                            wfNameInputParameter.toArgumentParameter({
                                value: '{{steps.create-wf.outputs.parameters.wf-name}}',
                            }),
                        ],
                    }),
                    template: waitWfTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'k8s-wait-wf-',
        },
        spec: new WorkflowSpec({
            entrypoint: k8sWaitWfTemplate,
        }),
    }).toWorkflow();
}
