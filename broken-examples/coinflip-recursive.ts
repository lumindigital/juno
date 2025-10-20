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

    const coinflipTemplate = new Template('coinflip', {
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
                    template: coinflipTemplate,
                    when: '{{steps.flip-coin.outputs.result}} == tails',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'coinflip-recursive-',
        },
        spec: new WorkflowSpec({
            entrypoint: coinflipTemplate,
        }),
    }).toWorkflow();
}
