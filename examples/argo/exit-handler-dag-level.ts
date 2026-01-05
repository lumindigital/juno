import { Arguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { simpleTag } from '../../src/api/expression';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const exitTemplate = new Template('exit', {
        container: new Container({
            args: ['task cleanup'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    const messageInputParameter = new InputParameter('message');

    const echoTemplate = new Template('echo', {
        container: new Container({
            args: [simpleTag(messageInputParameter)],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('A', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'A' })],
                    }),
                    onExit: exitTemplate,
                    template: echoTemplate,
                }),
                new DagTask('B', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'B' })],
                    }),
                    depends: 'A',
                    onExit: exitTemplate,
                    template: echoTemplate,
                }),
                new DagTask('C', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
                    }),
                    depends: 'A',
                    onExit: exitTemplate,
                    template: echoTemplate,
                }),
                new DagTask('D', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
                    }),
                    depends: 'B && C',
                    onExit: exitTemplate,
                    template: echoTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'exit-hanlder-dag-level-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
