import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const numInputParameter = new InputParameter('num');

    const oddOrEvenTemplate = new Template('odd-or-even', {
        container: new Container({
            args: [
                'sleep 1 &&\necho {{inputs.parameters.num}} > /tmp/num &&\nif [ $(({{inputs.parameters.num}}%2)) -eq 0 ]; then\n  echo "even" > /tmp/even;\nelse\n  echo "odd" > /tmp/even;\nfi\n',
            ],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
        outputs: new Outputs({
            parameters: [
                new OutputParameter('num', {
                    valueFrom: {
                        path: '/tmp/num',
                    },
                }),
                new OutputParameter('evenness', {
                    valueFrom: {
                        path: '/tmp/even',
                    },
                }),
            ],
        }),
    });

    const divideBy2Template = new Template('divide-by-2', {
        container: new Container({
            args: ['echo $(({{inputs.parameters.num}}/2))'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
    });

    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: ['{{inputs.parameters.message}}'],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const oddOrEvenTask = new DagTask('odd-or-even', {
        arguments: new Arguments({
            parameters: [numInputParameter.toArgumentParameter({ value: '{{item}}' })],
        }),
        template: oddOrEvenTemplate,
        withItems: [1, 2, 3, 4],
    });

    const divideBy2Task = new DagTask('divide-by-2', {
        arguments: new Arguments({
            parameters: [numInputParameter.toArgumentParameter({ value: '{{item.num}}' })],
        }),
        depends: oddOrEvenTask,
        template: divideBy2Template,
        when: '{{item.evenness}} == even',
        withParam: '{{tasks.odd-or-even.outputs.parameters}}',
    });

    const parameterAggregationTemplate = new Template('parameter-aggregation', {
        dag: new DagTemplate({
            tasks: [
                oddOrEvenTask,
                new DagTask('print-nums', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: '{{tasks.odd-or-even.outputs.parameters.num}}',
                            }),
                        ],
                    }),
                    depends: oddOrEvenTask,
                    template: printMessageTemplate,
                }),
                new DagTask('print-evenness', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: '{{tasks.odd-or-even.outputs.parameters.evenness}}',
                            }),
                        ],
                    }),
                    depends: oddOrEvenTask,
                    template: printMessageTemplate,
                }),
                divideBy2Task,
                new DagTask('print', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    depends: divideBy2Task,
                    template: printMessageTemplate,
                    withParam: '{{tasks.divide-by-2.outputs.result}}',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'parameter-aggregation-dag-',
        },
        spec: new WorkflowSpec({
            entrypoint: parameterAggregationTemplate,
        }),
    }).toWorkflow();
}
