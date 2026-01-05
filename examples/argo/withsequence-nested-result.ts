import { OutputResult } from '../../src/api/artifact';
import { simpleTag } from '../../src/api/expression';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloTemplate = new Template('hello', {
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import random
result = random.randint(0,5)
print(result)
`,
        }),
    });

    const helloBStep = new WorkflowStep('hello-b', {
        template: helloTemplate,
    });

    const helloHelloTemplate = new Template('hello-hello', {
        steps: [
            [helloBStep],
            [
                new WorkflowStep('hello-c', {
                    template: helloTemplate,
                    withSequence: {
                        end: simpleTag({ workflowStep: helloBStep, output: new OutputResult() }),
                        start: '1',
                    },
                }),
            ],
        ],
    });

    const helloAStep = new WorkflowStep('hello-a', {
        template: helloTemplate,
    });

    const helloEntrypointTemplate = new Template('hello-entrypoint', {
        steps: [
            [helloAStep],
            [
                new WorkflowStep('hello-b', {
                    template: helloHelloTemplate,
                    withSequence: {
                        end: simpleTag({ workflowStep: helloAStep, output: new OutputResult() }),
                        start: '1',
                    },
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'withsequence-nested-result-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloEntrypointTemplate,
        }),
    }).toWorkflow();
}
