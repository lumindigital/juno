import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter, WorkflowParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const aInputParameter = new InputParameter('a');
    const opInputParameter = new InputParameter('op');
    const bInputParameter = new InputParameter('b');

    const doMathTemplate = new Template('do-math', {
        inputs: new Inputs({
            parameters: [aInputParameter, opInputParameter, bInputParameter],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: 'print({{inputs.parameters.a}} {{inputs.parameters.op}} {{inputs.parameters.b}})\n',
        }),
    });

    const num1InputParameter = new InputParameter('num-1');

    const fibonacciHelperTemplate = new Template('fibonaccihelper', {
        inputs: new Inputs({
            parameters: [num1InputParameter],
        }),
        outputs: new Outputs({
            parameters: [
                new OutputParameter('result', {
                    valueFrom: {
                        parameter: '{{steps.add.outputs.result}}',
                    },
                }),
            ],
        }),
        steps: [
            [
                new WorkflowStep('sub-1', {
                    arguments: new Arguments({
                        parameters: [
                            aInputParameter.toArgumentParameter({ value: '{{inputs.parameters.num-1}}' }),
                            opInputParameter.toArgumentParameter({ value: '-' }),
                            bInputParameter.toArgumentParameter({ value: '1' }),
                        ],
                    }),
                    template: doMathTemplate,
                }),
            ],
            [
                new WorkflowStep('sub-2', {
                    arguments: new Arguments({
                        parameters: [
                            aInputParameter.toArgumentParameter({ value: '{{inputs.parameters.num-1}}' }),
                            opInputParameter.toArgumentParameter({ value: '-' }),
                            bInputParameter.toArgumentParameter({ value: '2' }),
                        ],
                    }),
                    template: doMathTemplate,
                    when: '{{inputs.parameters.num-1}} != 1 && {{inputs.parameters.num-1}} != 2',
                }),
            ],
            [
                new WorkflowStep('fib-sub-1', {
                    arguments: new Arguments({
                        parameters: [
                            new InputParameter('num').toArgumentParameter({ value: '{{steps.sub-1.outputs.result}}' }),
                        ],
                    }),
                    template: fibonacciTemplate,
                }),
            ],
            [
                new WorkflowStep('fib-sub-2', {
                    arguments: new Arguments({
                        parameters: [
                            new InputParameter('num').toArgumentParameter({ value: '{{steps.sub-2.outputs.result}}' }),
                        ],
                    }),
                    template: fibonacciTemplate,
                }),
            ],
            [
                new WorkflowStep('add', {
                    arguments: new Arguments({
                        parameters: [
                            aInputParameter.toArgumentParameter({
                                value: '{{steps.fib-sub-1.outputs.parameters.fib}}',
                            }),
                            opInputParameter.toArgumentParameter({ value: '+' }),
                            bInputParameter.toArgumentParameter({
                                value: '{{steps.fib-sub-2.outputs.parameters.fib}}',
                            }),
                        ],
                    }),
                    template: doMathTemplate,
                }),
            ],
        ],
    });

    const numInputParameter = new InputParameter('num');

    const fibonacciTemplate = new Template('fibonacci', {
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
        memoize: {
            cache: {
                configMap: {
                    key: 'fibonacci-cache',
                    name: 'fibonacci-m',
                },
            },
            key: '{{inputs.parameters.num}}',
            maxAge: '120s',
        },
        outputs: new Outputs({
            parameters: [
                new OutputParameter('fib', {
                    valueFrom: {
                        expression:
                            "asInt(inputs.parameters.num) == 1? 1: asInt(inputs.parameters.num) == 2? 1: steps['fibonacci-helper'].outputs.parameters.result",
                    },
                }),
            ],
        }),
        steps: [
            [
                new WorkflowStep('fibonacci-helper', {
                    arguments: new Arguments({
                        parameters: [num1InputParameter.toArgumentParameter({ value: '{{inputs.parameters.num}}' })],
                    }),
                    template: fibonacciHelperTemplate,
                    when: '{{inputs.parameters.num}} != 1 && {{inputs.parameters.num}} != 2',
                }),
            ],
        ],
    });

    const resultInputParameter = new InputParameter('result');

    const printResultTemplate = new Template('printresult', {
        container: new Container({
            args: ['echo {{inputs.parameters.result}}'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [resultInputParameter],
        }),
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('fibonaccimain', {
                    arguments: new Arguments({
                        parameters: [numInputParameter.toArgumentParameter({ value: '{{workflow.parameters.num}}' })],
                    }),
                    template: fibonacciTemplate,
                }),
            ],
            [
                new WorkflowStep('printresult', {
                    arguments: new Arguments({
                        parameters: [
                            resultInputParameter.toArgumentParameter({
                                value: '{{steps.fibonaccimain.outputs.parameters.fib}}',
                            }),
                        ],
                    }),
                    template: printResultTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This example demonstrates fibonacci sequence problem using conditional parameter feature.\n',
                'workflows.argoproj.io/veriiony': '>= 3.1.0',
            },
            generateName: 'fibonacci-',
        },
        spec: new WorkflowSpec({
            arguments: new Arguments({
                parameters: [new WorkflowParameter('num', { value: '5' })],
            }),
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
