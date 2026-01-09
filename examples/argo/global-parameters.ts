import { WorkflowArguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expressions/tag';
import { WorkflowParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageWorkflowParameter = new WorkflowParameter('message', {
        value: 'hello world',
    });

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: [simpleTag(messageWorkflowParameter).toString()],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'global-parameters-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [messageWorkflowParameter],
            }),
            entrypoint: printMessageTemplate,
        }),
    }).toWorkflow();
}
