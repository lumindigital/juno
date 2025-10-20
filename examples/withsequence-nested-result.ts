import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

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

    const helloHelloTemplate = new Template('hello-hello', {
        steps: [
            [
                new WorkflowStep('hello-b', {
                    template: helloTemplate,
                }),
            ],
            [
                new WorkflowStep('hello-c', {
                    template: helloTemplate,
                    withSequence: {
                        end: '{{steps.hello-b.outputs.result}}',
                        start: '1',
                    },
                }),
            ],
        ],
    });

    const helloEntrypointTemplate = new Template('hello-entrypoint', {
        steps: [
            [
                new WorkflowStep('hello-a', {
                    template: helloTemplate,
                }),
            ],
            [
                new WorkflowStep('hello-b', {
                    template: helloHelloTemplate,
                    withSequence: {
                        end: '{{steps.hello-a.outputs.result}}',
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
