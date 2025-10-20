import { Arguments } from '../src/api/arguments';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
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
            source: `print({{inputs.parameters.counter}} + 1)
`,
        }),
    });

    const limitInputParameter = new InputParameter('limit');

    const loopTemplate = new Template('loop', {
        inputs: new Inputs({
            parameters: [counterInputParameter, limitInputParameter],
        }),
        steps: [
            [
                new WorkflowStep('iterate-counter', {
                    arguments: new Arguments({
                        parameters: [
                            counterInputParameter.toArgumentParameter({ value: '{{inputs.parameters.counter}}' }),
                        ],
                    }),
                    template: counterIterationTemplate,
                }),
            ],
            [
                new WorkflowStep('continue', {
                    arguments: new Arguments({
                        parameters: [
                            counterInputParameter.toArgumentParameter({
                                value: '{{steps.iterate-counter.outputs.result}}',
                            }),
                            limitInputParameter.toArgumentParameter({ value: '{{inputs.parameters.limit}}' }),
                        ],
                    }),
                    template: loopTemplate,
                    when: '{{steps.iterate-counter.outputs.result}} < {{inputs.parameters.limit}}',
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
