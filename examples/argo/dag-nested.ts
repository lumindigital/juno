import { Arguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { simpleTag } from '../../src/api/expressions/tag';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { and } from '../../src/api/expressions/logical';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const echoTemplate = new Template('echo', {
        container: new Container({
            command: ['echo', simpleTag(messageInputParameter).toString()],
            image: 'alpine:3.7',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const taskA = new DagTask('A', {
        arguments: new Arguments({
            parameters: [
                messageInputParameter.toArgumentParameter({
                    value: `${simpleTag(messageInputParameter)}A`,
                }),
            ],
        }),
        template: echoTemplate,
    });

    const taskB = new DagTask('B', {
        arguments: new Arguments({
            parameters: [
                messageInputParameter.toArgumentParameter({
                    value: `${simpleTag(messageInputParameter)}B`,
                }),
            ],
        }),
        dependsExpression: taskA,
        template: echoTemplate,
    });

    const taskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [
                messageInputParameter.toArgumentParameter({
                    value: `${simpleTag(messageInputParameter)}C`,
                }),
            ],
        }),
        dependsExpression: taskA,
        template: echoTemplate,
    });

    const taskD = new DagTask('D', {
        arguments: new Arguments({
            parameters: [
                messageInputParameter.toArgumentParameter({
                    value: `${simpleTag(messageInputParameter)}D`,
                }),
            ],
        }),
        dependsExpression: and([taskB, taskC]),
        template: echoTemplate,
    });

    const nestedDiamondTemplate = new Template('nested-diamond', {
        dag: new DagTemplate({
            tasks: [taskA, taskB, taskC, taskD],
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const dagTaskA = new DagTask('A', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'A' })],
        }),
        template: nestedDiamondTemplate,
    });
    const dagTaskB = new DagTask('B', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'B' })],
        }),
        dependsExpression: dagTaskA,
        template: nestedDiamondTemplate,
    });
    const dagTaskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
        }),
        dependsExpression: dagTaskA,
        template: nestedDiamondTemplate,
    });
    const dagTaskD = new DagTask('D', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
        }),
        dependsExpression: and([dagTaskB, dagTaskC]),
        template: nestedDiamondTemplate,
    });

    const diamondTemplate = new Template('diamond', {
        dag: new DagTemplate({
            tasks: [dagTaskA, dagTaskB, dagTaskC, dagTaskD],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-nested-',
        },
        spec: new WorkflowSpec({
            entrypoint: diamondTemplate,
        }),
    }).toWorkflow();
}
