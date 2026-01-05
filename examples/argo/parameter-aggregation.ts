import { Arguments } from '../../src/api/arguments';
import { OutputResult } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expression';
import { Inputs } from '../../src/api/inputs';
import { Outputs } from '../../src/api/outputs';
import { FromItemProperty, InputParameter, OutputParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const numInputParameter = new InputParameter('num');

    const numOutputParameter = new OutputParameter('num', {
        valueFrom: {
            path: '/tmp/num',
        },
    });
    const evennessOutputParameter = new OutputParameter('evenness', {
        valueFrom: {
            path: '/tmp/even',
        },
    });

    const oddOrEvenTemplate = new Template('odd-or-even', {
        container: new Container({
            args: [
                `sleep 1 &&\necho ${simpleTag(numInputParameter)} > /tmp/num &&\nif [ $((${simpleTag(numInputParameter)}%2)) -eq 0 ]; then\n  echo "even" > /tmp/even;\nelse\n  echo "odd" > /tmp/even;\nfi\n`,
            ],
            command: ['sh', '-xc'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
        outputs: new Outputs({
            parameters: [numOutputParameter, evennessOutputParameter],
        }),
    });

    const divideBy2Template = new Template('divide-by-2', {
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
        script: new Script({
            command: ['sh', '-x'],
            image: 'alpine:latest',
            source: `#!/bin/sh\necho $((${simpleTag(numInputParameter)}/2))\n`,
        }),
    });

    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: [`${simpleTag(messageInputParameter)}`],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const oddOrEvenStep = new WorkflowStep('odd-or-even', {
        arguments: new Arguments({
            parameters: [numInputParameter.toArgumentParameter({ valueFromExpressionArgs: new FromItemProperty() })],
        }),
        template: oddOrEvenTemplate,
        withItems: [1, 2, 3, 4],
    });

    const divideBy2Step = new WorkflowStep('divide-by-2', {
        arguments: new Arguments({
            parameters: [
                numInputParameter.toArgumentParameter({
                    valueFromExpressionArgs: new FromItemProperty('num'),
                }),
            ],
        }),
        template: divideBy2Template,
        when: `${simpleTag(new FromItemProperty('evenness'))} == even`,
        withParamExpression: { workflowStepOutputParameter: oddOrEvenStep },
    });

    const parameterAggregationTemplate = new Template('parameter-aggregation', {
        steps: [
            [oddOrEvenStep],
            [
                new WorkflowStep('print-nums', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: { workflowStep: oddOrEvenStep, output: numOutputParameter },
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
                                valueFromExpressionArgs: {
                                    workflowStep: oddOrEvenStep,
                                    output: evennessOutputParameter,
                                },
                            }),
                        ],
                    }),
                    template: printMessageTemplate,
                }),
            ],
            [divideBy2Step],
            [
                new WorkflowStep('print', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    template: printMessageTemplate,
                    withParamExpression: { workflowStep: divideBy2Step, output: new OutputResult() },
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
