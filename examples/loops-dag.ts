import { Arguments } from '../src/api/arguments';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { simpleTag } from '../src/api/expression';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: [simpleTag(messageInputParameter)],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const loopsDagTemplate = new Template('loops-dag', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('A', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'A' })],
                    }),
                    template: printMessageTemplate,
                }),
                new DagTask('B', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    depends: 'A',
                    template: printMessageTemplate,
                    withItems: ['foo', 'bar', 'baz'],
                }),
                new DagTask('C', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
                    }),
                    depends: 'B',
                    template: printMessageTemplate,
                }),
            ],
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
