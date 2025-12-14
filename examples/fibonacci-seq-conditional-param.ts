import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { OutputResult } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { RecursiveTemplate } from '../src/api/recursive-template';
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
            source: `print(${simpleTag(aInputParameter)} ${simpleTag(opInputParameter)} ${simpleTag(bInputParameter)})\n`,
        }),
    });

    const return1Template = new Template('return-1', {
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: 'print(1)',
        }),
    });

    const num1InputParameter = new InputParameter('num-1');

    const fibOutputParameter = new OutputParameter('fib', {
        valueFrom: {
            expression:
                "asInt(inputs.parameters.num) == 1? 1: asInt(inputs.parameters.num) == 2? 1: steps['fibonacci-helper'].outputs.parameters.result",
        },
    });

    const sub1WorkflowStep = new WorkflowStep('sub-1', {
        arguments: new Arguments({
            parameters: [
                aInputParameter.toArgumentParameter({ valueFromExpressionArgs: num1InputParameter }),
                opInputParameter.toArgumentParameter({ value: '-' }),
                bInputParameter.toArgumentParameter({ value: '1' }),
            ],
        }),
        template: doMathTemplate,
    });

    const sub2WorkflowStep = new WorkflowStep('sub-2', {
        arguments: new Arguments({
            parameters: [
                aInputParameter.toArgumentParameter({ valueFromExpressionArgs: num1InputParameter }),
                opInputParameter.toArgumentParameter({ value: '-' }),
                bInputParameter.toArgumentParameter({ value: '2' }),
            ],
        }),
        template: doMathTemplate,
        when: `${simpleTag(num1InputParameter)} != 1 && ${simpleTag(num1InputParameter)} != 2`,
    });

    const fibSub1WorkflowStep = new WorkflowStep('fib-sub-1', {
        arguments: new Arguments({
            parameters: [
                new InputParameter('num').toArgumentParameter({
                    valueFromExpressionArgs: { workflowStep: sub1WorkflowStep, output: new OutputResult() },
                }),
            ],
        }),
        template: new RecursiveTemplate('fibonacci'),
    });

    const fibSub2WorkflowStep = new WorkflowStep('fib-sub-2', {
        arguments: new Arguments({
            parameters: [
                new InputParameter('num').toArgumentParameter({
                    valueFromExpressionArgs: { workflowStep: sub2WorkflowStep, output: new OutputResult() },
                }),
            ],
        }),
        template: new RecursiveTemplate('fibonacci'),
    });

    const addWorkflowStep = new WorkflowStep('add', {
        arguments: new Arguments({
            parameters: [
                aInputParameter.toArgumentParameter({
                    valueFromExpressionArgs: { workflowStep: fibSub1WorkflowStep, output: fibOutputParameter },
                }),
                opInputParameter.toArgumentParameter({ value: '+' }),
                bInputParameter.toArgumentParameter({
                    valueFromExpressionArgs: { workflowStep: fibSub2WorkflowStep, output: fibOutputParameter },
                }),
            ],
        }),
        template: doMathTemplate,
    });

    const fibonacciHelperTemplate = new Template('fibonaccihelper', {
        inputs: new Inputs({
            parameters: [num1InputParameter],
        }),
        outputs: new Outputs({
            parameters: [
                new OutputParameter('result', {
                    valueFrom: {
                        parameter: `${simpleTag({ workflowStep: addWorkflowStep, output: new OutputResult() })}`,
                    },
                }),
            ],
        }),
        steps: [
            [sub1WorkflowStep],
            [sub2WorkflowStep],
            [fibSub1WorkflowStep],
            [fibSub2WorkflowStep],
            [addWorkflowStep],
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
            key: simpleTag(numInputParameter),
            maxAge: '120s',
        },
        outputs: new Outputs({
            parameters: [fibOutputParameter],
        }),
        steps: [
            [
                new WorkflowStep('fibonacci-helper', {
                    arguments: new Arguments({
                        parameters: [
                            num1InputParameter.toArgumentParameter({ valueFromExpressionArgs: numInputParameter }),
                        ],
                    }),
                    template: fibonacciHelperTemplate,
                    when: `${simpleTag(numInputParameter)} != 1 && ${simpleTag(numInputParameter)} != 2`,
                }),
            ],
        ],
    });

    const resultInputParameter = new InputParameter('result');

    const printResultTemplate = new Template('printresult', {
        container: new Container({
            args: [`echo ${simpleTag(resultInputParameter)}`],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [resultInputParameter],
        }),
    });

    const fibMainWorkflowStep = new WorkflowStep('fibonaccimain', {
        arguments: new Arguments({
            parameters: [
                numInputParameter.toArgumentParameter({
                    valueFromExpressionArgs: numInputParameter.toWorkflowParameter({}),
                }),
            ],
        }),
        template: fibonacciTemplate,
    });

    const mainTemplate = new Template('main', {
        steps: [
            [fibMainWorkflowStep],
            [
                new WorkflowStep('printresult', {
                    arguments: new Arguments({
                        parameters: [
                            resultInputParameter.toArgumentParameter({
                                value: `${simpleTag({ workflowStep: fibMainWorkflowStep, output: fibOutputParameter })}`,
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
            arguments: new WorkflowArguments({
                parameters: [numInputParameter.toWorkflowParameter({ value: '5' })],
            }),
            entrypoint: mainTemplate,
            additionalTemplates: [return1Template],
        }),
    }).toWorkflow();
}
