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
    const workflowtemplateInputParameter = new InputParameter('workflowtemplate');

    const resourceWithoutArgumentTemplate = new Template('resource-without-argument', {
        inputs: new Inputs({
            parameters: [workflowtemplateInputParameter],
        }),
        resource: {
            action: 'create',
            failureCondition: 'status.phase in (Failed, Error)',
            manifest: `apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: workflow-of-workflows-1-
spec:
  workflowTemplateRef:
    name: ${simpleTag(workflowtemplateInputParameter)}
`,
            successCondition: 'status.phase == Succeeded',
        },
    });

    const messageInputParameter = new InputParameter('message');

    const resourceWithArgumentTemplate = new Template('resource-with-argument', {
        inputs: new Inputs({
            parameters: [workflowtemplateInputParameter, messageInputParameter],
        }),
        resource: {
            action: 'create',
            failureCondition: 'status.phase in (Failed, Error)',
            manifest: `apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: workflow-of-workflows-2-
spec:
  arguments:
    parameters:
    - name: message
      value: ${simpleTag(messageInputParameter)}
  workflowTemplateRef:
    name: ${simpleTag(workflowtemplateInputParameter)}
`,
            successCondition: 'status.phase == Succeeded',
        },
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('workflow1', {
                    arguments: new Arguments({
                        parameters: [
                            workflowtemplateInputParameter.toArgumentParameter({
                                value: 'workflow-template-submittable',
                            }),
                        ],
                    }),
                    template: resourceWithoutArgumentTemplate,
                }),
            ],
            [
                new WorkflowStep('workflow2', {
                    arguments: new Arguments({
                        parameters: [
                            workflowtemplateInputParameter.toArgumentParameter({
                                value: 'workflow-template-submittable',
                            }),
                            messageInputParameter.toArgumentParameter({ value: 'Welcome Argo' }),
                        ],
                    }),
                    template: resourceWithArgumentTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'workflow-of-workflows-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
