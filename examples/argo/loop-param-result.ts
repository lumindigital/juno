import { Arguments } from '../../src/api/arguments';
import { OutputResult } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expression';
import { Inputs } from '../../src/api/inputs';
import { FromItemProperty, InputParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const genNumberListTemplate = new Template('gen-number-list', {
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import json
import sys
json.dump([i for i in range(20, 31)], sys.stdout)
`,
        }),
    });

    const secondsInputParameter = new InputParameter('seconds');
    const sleepNSecTemplate = new Template('sleep-n-sec', {
        container: new Container({
            args: [
                `echo sleeping for ${simpleTag(secondsInputParameter)} seconds; sleep ${simpleTag(secondsInputParameter)}; echo done`,
            ],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({ parameters: [secondsInputParameter] }),
    });

    const generateStep = new WorkflowStep('generate', { template: genNumberListTemplate });

    const loopParamResultExampleTemplate = new Template('loop-param-result-example', {
        steps: [
            [generateStep],
            [
                new WorkflowStep('sleep', {
                    arguments: new Arguments({
                        parameters: [
                            secondsInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    template: sleepNSecTemplate,
                    withParamExpression: { output: new OutputResult(), workflowStep: generateStep },
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: { generateName: 'loops-param-result-' },
        spec: new WorkflowSpec({
            entrypoint: loopParamResultExampleTemplate,
        }),
    }).toWorkflow();
}
