import { Arguments } from '../src/api/arguments';
import { OutputResult } from '../src/api/artifact';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { RecursiveTemplate } from '../src/api/recursive-template';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const counterInputParameter = new InputParameter('counter');

    const counterIterationTemplate = new Template('counter-iteration', {
        inputs: new Inputs({
            parameters: [counterInputParameter],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `print(${simpleTag(counterInputParameter)} + 1)
`,
        }),
    });

    const limitInputParameter = new InputParameter('limit');
    const iterateCounterStep = new WorkflowStep('iterate-counter', {
        arguments: new Arguments({
            parameters: [counterInputParameter.toArgumentParameter({ valueFromExpressionArgs: counterInputParameter })],
        }),
        template: counterIterationTemplate,
    });

    const loopTemplate = new Template('loop', {
        inputs: new Inputs({
            parameters: [counterInputParameter, limitInputParameter],
        }),
        steps: [
            [iterateCounterStep],
            [
                new WorkflowStep('continue', {
                    arguments: new Arguments({
                        parameters: [
                            counterInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: {
                                    workflowStep: iterateCounterStep,
                                    output: new OutputResult(),
                                },
                            }),
                            limitInputParameter.toArgumentParameter({ valueFromExpressionArgs: limitInputParameter }),
                        ],
                    }),
                    template: new RecursiveTemplate('loop'),
                    when: `${simpleTag({ workflowStep: iterateCounterStep, output: new OutputResult() })} < ${simpleTag(limitInputParameter)}`,
                }),
            ],
        ],
    });

    const planTemplate = new Template('plan', {
        steps: [
            [
                new WorkflowStep('recurse', {
                    arguments: new Arguments({
                        parameters: [
                            counterInputParameter.toArgumentParameter({ value: '0' }),
                            limitInputParameter.toArgumentParameter({ value: '10' }),
                        ],
                    }),
                    template: loopTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'recursive-loop-',
        },
        spec: new WorkflowSpec({
            entrypoint: planTemplate,
        }),
    }).toWorkflow();
}
