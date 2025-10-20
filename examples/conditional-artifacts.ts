import { OutputArtifact } from '../src/api/artifact';
import { Outputs } from '../src/api/outputs';
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
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('result', {
                    path: '/result.txt',
                }),
            ],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `with open("result.txt", "w") as f:
  f.write("it was heads")
`,
        }),
    });

    const tailsTemplate = new Template('tails', {
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('result', {
                    path: '/result.txt',
                }),
            ],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `with open("result.txt", "w") as f:
  f.write("it was tails")
`,
        }),
    });

    const mainTemplate = new Template('main', {
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('result', {
                    fromExpression:
                        "steps['flip-coin'].outputs.result == 'heads' ? steps.heads.outputs.artifacts.result : steps.tails.outputs.artifacts.result",
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
                'workflows.argoproj.io/description':
                    'Conditional artifacts provide a way to choose the output artifacts based on expression.\n\nIn this example the main template has two steps which will run conditionall using `when` .\n\nBased on the `when` condition one of step will not execute. The main template\'s output artifact named "result"\nwill be set to the executed step\'s output.\n',
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'conditional-artifacts-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
