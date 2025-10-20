import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const numInputParameter = new InputParameter('num');

    const oddOrEvenTemplate = new Template('odd-or-even', {
        container: new Container({
            args: [
                'sleep 1 &&\necho {{inputs.parameters.num}} > /tmp/num &&\nif [ $(({{inputs.parameters.num}}%2)) -eq 0 ]; then\n  echo "even" > /tmp/even;\nelse\n  echo "odd" > /tmp/even;\nfi\n',
            ],
            command: ['sh', '-xc'],
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
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
        script: new Script({
            command: ['sh', '-x'],
            image: 'alpine:latest',
            source: '#!/bin/sh\necho $(({{inputs.parameters.num}}/2))\n',
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

    const oddOrEvenStep = new WorkflowStep('odd-or-even', {
        arguments: new Arguments({
            parameters: [numInputParameter.toArgumentParameter({ value: '{{item}}' })],
        }),
        template: oddOrEvenTemplate,
        withItems: [1, 2, 3, 4],
    });

    const parameterAggregationTemplate = new Template('parameter-aggregation', {
        steps: [
            [oddOrEvenStep],
            [
                new WorkflowStep('print-nums', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: '{{steps.odd-or-even.outputs.parameters.num}}',
                            }),
                        ],
                    }),
                    template: printMessageTemplate,
                }),
            ],
            [
                new WorkflowStep('print-evenness', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: '{{steps.odd-or-even.outputs.parameters.evenness}}',
                            }),
                        ],
                    }),
                    template: printMessageTemplate,
                }),
            ],
            [
                new WorkflowStep('divide-by-2', {
                    arguments: new Arguments({
                        parameters: [numInputParameter.toArgumentParameter({ value: '{{item.num}}' })],
                    }),
                    template: divideBy2Template,
                    when: '{{item.evenness}} == even',
                    withParam: '{{steps.odd-or-even.outputs.parameters}}',
                }),
            ],
            [
                new WorkflowStep('print', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    template: printMessageTemplate,
                    withParam: '{{steps.divide-by-2.outputs.result}}',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'parameter-aggregation-',
        },
        spec: new WorkflowSpec({
            entrypoint: parameterAggregationTemplate,
        }),
    }).toWorkflow();
}
