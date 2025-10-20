import { Outputs } from '../src/api/outputs';
import { OutputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const flipCoinTemplate = new Template('flip-coin', {
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import random
print("heads" if random.randint(0,1) == 0 else "tails")
`,
        }),
    });

    const headsTemplate = new Template('heads', {
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `print("heads")
`,
        }),
    });

    const tailsTemplate = new Template('tails', {
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `print("tails")
`,
        }),
    });

    const mainTemplate = new Template('main', {
        outputs: new Outputs({
            parameters: [
                new OutputParameter('stepresult', {
                    valueFrom: {
                        expression:
                            "steps['flip-coin'].outputs.result == 'heads' ? steps.heads.outputs.result : steps.tails.outputs.result",
                    },
                }),
            ],
        }),
        steps: [
            [
                new WorkflowStep('flip-coin', {
                    template: flipCoinTemplate,
                }),
            ],
            [
                new WorkflowStep('heads', {
                    template: headsTemplate,
                    when: '{{steps.flip-coin.outputs.result}} == heads',
                }),
                new WorkflowStep('tails', {
                    template: tailsTemplate,
                    when: '{{steps.flip-coin.outputs.result}} == tails',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `Conditional parameters provide a way to choose the output parameters based on expression.

In this example the step template has two steps which will run conditionally on \`when\`.

Based on that condition, one of step will not be executed. The step template's output parameter will be
set from the executed step's output.
`,
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'conditional-parameter-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
