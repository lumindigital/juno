import { Arguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { Outputs } from '../../src/api/outputs';
import { InputParameter, OutputParameter } from '../../src/api/parameter';
import { ParameterValueFrom } from '../../src/api/parameter-value-from';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const messageOutputParameter = new OutputParameter('message', {
        valueFrom: new ParameterValueFrom({
            supplied: {},
        }),
    });

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: [simpleTag(messageInputParameter).toString()],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const approveTemplate = new Template('approve', {
        outputs: new Outputs({
            parameters: [messageOutputParameter],
        }),
        suspend: {},
    });

    const approveStep = new WorkflowStep('approve', {
        template: approveTemplate,
    });

    const suspendTemplate = new Template('suspend', {
        steps: [
            [approveStep],
            [
                new WorkflowStep('release', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: { workflowStep: approveStep, output: messageOutputParameter },
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
