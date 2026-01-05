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

    const nestedDiamondTemplate = new Template('nested-diamond', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('A', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: `${simpleTag(messageInputParameter)}A`,
                            }),
                        ],
                    }),
                    template: echoTemplate,
                }),
                new DagTask('B', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: `${simpleTag(messageInputParameter)}B`,
                            }),
                        ],
                    }),
                    depends: 'A',
                    template: echoTemplate,
                }),
                new DagTask('C', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: `${simpleTag(messageInputParameter)}C`,
                            }),
                        ],
                    }),
                    depends: 'A',
                    template: echoTemplate,
                }),
                new DagTask('D', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: `${simpleTag(messageInputParameter)}D`,
                            }),
                        ],
                    }),
                    depends: 'B && C',
                    template: echoTemplate,
                }),
            ],
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
        depends: dagTaskA,
        template: nestedDiamondTemplate,
    });
    const dagTaskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'C' })],
        }),
        depends: dagTaskA,
        template: nestedDiamondTemplate,
    });
    const dagTaskD = new DagTask('D', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
        }),
        depends: 'B && C',
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
