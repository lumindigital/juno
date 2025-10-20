import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const secondsInputParameter = new InputParameter('seconds');

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

    const sleepNSecTemplate = new Template('sleep-n-sec', {
        container: new Container({
            args: [
                `echo sleeping for ${simpleTag(secondsInputParameter)} seconds; sleep ${simpleTag(secondsInputParameter)}; echo done`,
            ],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [secondsInputParameter],
        }),
    });

    const loopParamResultExampleTemplate = new Template('loop-param-result-example', {
        steps: [
            [
                new WorkflowStep('generate', {
                    template: genNumberListTemplate,
                }),
            ],
            [
                new WorkflowStep('sleep', {
                    arguments: new Arguments({
                        parameters: [secondsInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    template: sleepNSecTemplate,
                    withParam: '{{steps.generate.outputs.result}}',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'loops-param-result-',
        },
        spec: new WorkflowSpec({
            entrypoint: loopParamResultExampleTemplate,
        }),
    }).toWorkflow();
}
