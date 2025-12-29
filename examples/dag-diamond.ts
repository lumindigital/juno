import { Arguments } from '../src/api/arguments';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../src/api/expression';
import { Container } from '../src/api/container';
import { and } from '../src/api/expr-api';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const echoTemplateInputs = new Inputs({
        parameters: [messageInputParameter],
    });

    const echoTemplate = new Template('echo', {
        container: new Container({
            command: ['echo', simpleTag(echoTemplateInputs.parameters?.[0] as InputParameter)],
            image: 'alpine:3.7',
        }),
        inputs: echoTemplateInputs,
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
        depends: taskA,
        template: echoTemplate,
    });

    const taskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
        }),
        depends: taskA,
        template: echoTemplate,
    });

    const diamondTemplate = new Template('diamond', {
        dag: new DagTemplate({
            tasks: [
                taskA,
                taskB,
                taskC,
                new DagTask('D', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
                    }),
                    depends: and([taskB, taskC]),
                    template: echoTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-diamond-',
        },
        spec: new WorkflowSpec({
            entrypoint: diamondTemplate,
        }),
    }).toWorkflow();
}
