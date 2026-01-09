import { Arguments, WorkflowArguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../src/api/parameter';
import { simpleTag } from '../../src/api/expressions/tag';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { and } from '../../src/api/expressions/logical';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const target = new WorkflowParameter('target', {
        value: 'E',
    });

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
        dependsExpression: dagTaskA,
        template: echoTemplate,
    });
    const dagTaskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
        }),
        dependsExpression: dagTaskA,
        template: echoTemplate,
    });
    const dagTaskD = new DagTask('D', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
        }),
        dependsExpression: and([dagTaskB, dagTaskC]),
        template: echoTemplate,
    });
    const dagTaskE = new DagTask('E', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'E' })],
        }),
        dependsExpression: dagTaskC,
        template: echoTemplate,
    });

    const dagTargetTemplate = new Template('dag-target', {
        dag: new DagTemplate({
            targets: [target],
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
