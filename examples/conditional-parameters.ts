import { OutputResult } from '../src/api/artifact';
import { hyphenParameter, parameterArgsString, simpleTag } from '../src/api/expression';
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

    const flipCoinStep = new WorkflowStep('flip-coin', {
        template: flipCoinTemplate,
    });

    const headsStep = new WorkflowStep('heads', {
        template: headsTemplate,
        when: `${simpleTag({ task: flipCoinStep, parameter: new OutputResult() })} == heads`,
    });
    const tailsStep = new WorkflowStep('tails', {
        template: tailsTemplate,
        when: `${simpleTag({ task: flipCoinStep, parameter: new OutputResult() })} == tails`,
    });

    const mainTemplate = new Template('main', {
        outputs: new Outputs({
            parameters: [
                new OutputParameter('stepresult', {
                    valueFrom: {
                        expression: `${hyphenParameter({ task: flipCoinStep, parameter: new OutputResult() })} == 'heads' ? ${parameterArgsString({ task: headsStep, parameter: new OutputResult() })} : ${parameterArgsString({ task: tailsStep, parameter: new OutputResult() })}`,
                    },
                }),
            ],
        }),
        steps: [[flipCoinStep], [headsStep, tailsStep]],
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
