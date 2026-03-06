import { Arguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { FromItemProperty, InputParameter } from '../../src/api/parameter';
import { simpleTag } from '../../src/api/expressions/tag';
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

    const taskA = new DagTask('A', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'A' })],
        }),
        template: printMessageTemplate,
    });

    const taskB = new DagTask('B', {
        arguments: new Arguments({
            parameters: [
                messageInputParameter.toArgumentParameter({
                    valueFromExpressionArgs: new FromItemProperty(),
                }),
            ],
        }),
        dependsExpression: taskA,
        template: printMessageTemplate,
        withItems: ['foo', 'bar', 'baz'],
    });

    const taskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
        }),
        dependsExpression: taskB,
        template: printMessageTemplate,
    });

    const loopsDagTemplate = new Template('loops-dag', {
        dag: new DagTemplate({
            tasks: [taskA, taskB, taskC],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'loops-dag-',
        },
        spec: new WorkflowSpec({
            entrypoint: loopsDagTemplate,
        }),
    }).toWorkflow();
}
