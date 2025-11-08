import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../src/api/parameter';
import { and, simpleTag } from '../src/api/expression';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const target = new WorkflowParameter('target', {
        value: 'E',
    });

    const messageInputParameter = new InputParameter('message');

    const echoTemplate = new Template('echo', {
        container: new Container({
            command: ['echo', simpleTag(messageInputParameter)],
            image: 'alpine:3.7',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const dagTaskA = new DagTask('A', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'A' })],
        }),
        template: echoTemplate,
    });
    const dagTaskB = new DagTask('B', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'B' })],
        }),
        depends: dagTaskA,
        template: echoTemplate,
    });
    const dagTaskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
        }),
        depends: dagTaskA,
        template: echoTemplate,
    });
    const dagTaskD = new DagTask('D', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
        }),
        depends: and([dagTaskB, dagTaskC]),
        template: echoTemplate,
    });
    const dagTaskE = new DagTask('E', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'E' })],
        }),
        depends: dagTaskC,
        template: echoTemplate,
    });

    const dagTargetTemplate = new Template('dag-target', {
        dag: new DagTemplate({
            target: simpleTag(target),
            tasks: [dagTaskA, dagTaskB, dagTaskC, dagTaskD, dagTaskE],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-target-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [target],
            }),
            entrypoint: dagTargetTemplate,
        }),
    }).toWorkflow();
}
