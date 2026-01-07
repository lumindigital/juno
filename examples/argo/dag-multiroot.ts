import { Arguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
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

    const taskA = new DagTask('A', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'A' })],
        }),
        template: echoTemplate,
    });

    const taskB = new DagTask('B', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'B' })],
        }),
        template: echoTemplate,
    });

    const taskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
        }),
        depends: taskA,
        template: echoTemplate,
    });
    const taskD = new DagTask('D', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
        }),
        depends: and([taskA, taskB]),
        template: echoTemplate,
    });

    const multirootTemplate = new Template('multiroot', {
        dag: new DagTemplate({
            tasks: [taskA, taskB, taskC, taskD],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-multiroot-',
        },
        spec: new WorkflowSpec({
            entrypoint: multirootTemplate,
        }),
    }).toWorkflow();
}
