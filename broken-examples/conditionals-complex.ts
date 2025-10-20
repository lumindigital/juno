import { Container } from '../src/api/container';
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
result = "heads" if random.randint(0,1) == 0 else "tails"
print(result)
`,
        }),
    });

    const headsTemplate = new Template('heads', {
        container: new Container({
            args: ['echo "it was heads"'],
            command: ['sh', '-c'],
            image: 'alpine:3.6',
        }),
    });

    const tailsTemplate = new Template('tails', {
        container: new Container({
            args: ['echo "it was tails"'],
            command: ['sh', '-c'],
            image: 'alpine:3.6',
        }),
    });

    const headsTailsOrTwiceTailsTemplate = new Template('heads-tails-or-twice-tails', {
        container: new Container({
            args: ['echo "it was heads the first flip and tails the second. Or it was two times tails."'],
            command: ['sh', '-c'],
            image: 'alpine:3.6',
        }),
    });

    const flipCoinStep = new WorkflowStep('flip-coin', {
        template: flipCoinTemplate,
    });

    const flipAgainStep = new WorkflowStep('flip-again', {
        template: flipCoinTemplate,
    });

    const coinflipTemplate = new Template('coinflip', {
        steps: [
            [flipCoinStep],
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
            [flipAgainStep],
            [
                new WorkflowStep('complex-condition', {
                    template: headsTailsOrTwiceTailsTemplate,
                    when: '( {{steps.flip-coin.outputs.result}} == heads && {{steps.flip-again.outputs.result}} == tails ) || ( {{steps.flip-coin.outputs.result}} == tails && {{steps.flip-again.outputs.result}} == tails )',
                }),
                new WorkflowStep('heads-regex', {
                    template: headsTemplate,
                    when: '{{steps.flip-again.outputs.result}} =~ hea',
                }),
                new WorkflowStep('tails-regex', {
                    template: tailsTemplate,
                    when: '{{steps.flip-again.outputs.result}} =~ tai',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'coinflip-',
        },
        spec: new WorkflowSpec({
            entrypoint: coinflipTemplate,
        }),
    }).toWorkflow();
}
