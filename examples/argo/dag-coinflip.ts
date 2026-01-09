import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Container } from '../../src/api/container';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { RecursiveTemplate } from '../../src/api/recursive-template';
import { OutputResult } from '../../src/api/artifact';
import { equals } from '../../src/api/expressions/comparison';
import { simpleTag } from '../../src/api/expressions/tag';
import { and } from '../../src/api/expressions/logical';

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

    const flipCoinStep = new WorkflowStep('flip-coin', {
        template: flipCoinTemplate,
    });

    const coinflipTemplate = new Template('coinflip', {
        steps: [
            [flipCoinStep],
            [
                new WorkflowStep('heads', {
                    template: headsTemplate,
                    whenExpression: equals(
                        simpleTag({ workflowStep: flipCoinStep, output: new OutputResult() }),
                        'heads',
                    ),
                }),
                new WorkflowStep('tails', {
                    template: new RecursiveTemplate('coinflip'),
                    whenExpression: equals(
                        simpleTag({ workflowStep: flipCoinStep, output: new OutputResult() }),
                        'tails',
                    ),
                }),
            ],
        ],
    });

    const taskA = new DagTask('A', {
        template: coinflipTemplate,
    });

    const taskB = new DagTask('B', {
        depends: taskA,
        template: coinflipTemplate,
    });

    const taskC = new DagTask('C', {
        depends: taskA,
        template: coinflipTemplate,
    });

    const diamondTemplate = new Template('diamond', {
        dag: new DagTemplate({
            tasks: [
                taskA,
                taskB,
                taskC,
                new DagTask('D', {
                    depends: and([taskB, taskC]),
                    template: coinflipTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': 'This is an example of coin flip defined as a DAG.\n',
            },
            generateName: 'dag-diamond-coinflip-',
        },
        spec: new WorkflowSpec({
            entrypoint: diamondTemplate,
        }),
    }).toWorkflow();
}
