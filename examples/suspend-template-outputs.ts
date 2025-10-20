import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: [simpleTag(messageInputParameter)],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const approveTemplate = new Template('approve', {
        outputs: new Outputs({
            parameters: [
                new OutputParameter('message', {
                    valueFrom: {
                        supplied: {},
                    },
                }),
            ],
        }),
        suspend: {},
    });

    const suspendTemplate = new Template('suspend', {
        steps: [
            [
                new WorkflowStep('approve', {
                    template: approveTemplate,
                }),
            ],
            [
                new WorkflowStep('release', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: '{{steps.approve.outputs.parameters.message}}',
                            }),
                        ],
                    }),
                    template: printMessageTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            name: 'suspend-outputs',
        },
        spec: new WorkflowSpec({
            entrypoint: suspendTemplate,
        }),
    }).toWorkflow();
}
