import { Arguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { FromItemProperty, InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../../src/api/expressions/tag';
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

    const echoThriceTemplate = new Template('echo-thrice', {
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
        steps: [
            [
                new WorkflowStep('echo', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: `${simpleTag(messageInputParameter)}${simpleTag(new FromItemProperty())}`,
                            }),
                        ],
                    }),
                    template: echoTemplate,
                    withItems: [1, 2, 3],
                }),
            ],
        ],
    });

    const taskA = new DagTask('A', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'A' })],
        }),
        template: echoThriceTemplate,
    });
    const taskB = new DagTask('B', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'B' })],
        }),
        dependsExpression: taskA,
        template: echoThriceTemplate,
    });
    const taskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
        }),
        dependsExpression: taskA,
        template: echoThriceTemplate,
    });
    const taskD = new DagTask('D', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
        }),
        dependsExpression: and([taskB, taskC]),
        template: echoThriceTemplate,
    });

    const diamondTemplate = new Template('diamond', {
        dag: new DagTemplate({
            tasks: [taskA, taskB, taskC, taskD],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-diamond-steps-',
        },
        spec: new WorkflowSpec({
            entrypoint: diamondTemplate,
        }),
    }).toWorkflow();
}
