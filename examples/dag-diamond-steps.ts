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
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
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
                                value: '{{inputs.parameters.message}}{{item}}',
                            }),
                        ],
                    }),
                    template: echoTemplate,
                    withItems: [1, 2, 3],
                }),
            ],
        ],
    });

    const diamondTemplate = new Template('diamond', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('A', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'A' })],
                    }),
                    template: echoThriceTemplate,
                }),
                new DagTask('B', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'B' })],
                    }),
                    depends: 'A',
                    template: echoThriceTemplate,
                }),
                new DagTask('C', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
                    }),
                    depends: 'A',
                    template: echoThriceTemplate,
                }),
                new DagTask('D', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
                    }),
                    depends: 'B && C',
                    template: echoThriceTemplate,
                }),
            ],
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
