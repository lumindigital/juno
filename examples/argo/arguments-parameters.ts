import { WorkflowArguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

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

    return new Workflow({
        metadata: {
            generateName: 'arguments-parameters-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    messageInputParameter.toWorkflowParameter({
                        value: 'hello world',
                    }),
                ],
            }),
            entrypoint: printMessageTemplate,
        }),
    }).toWorkflow();
}
