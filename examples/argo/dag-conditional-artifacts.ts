import { OutputArtifact, OutputResult } from '../../src/api/artifact';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { ternary } from '../../src/api/expressions/conditional';
import { hyphenateExpressionArgs, simpleTag } from '../../src/api/expressions/tag';
import { equals } from '../../src/api/expressions/comparison';
import { Outputs } from '../../src/api/outputs';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
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

    const resultArtifact = new OutputArtifact('result', {
        path: '/result.txt',
    });

    const headsTemplate = new Template('heads', {
        outputs: new Outputs({
            artifacts: [resultArtifact],
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
            artifacts: [resultArtifact],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `with open("result.txt", "w") as f:
  f.write("it was tails")
`,
        }),
    });

    const flipCoinTask = new DagTask('flip-coin', {
        template: flipCoinTemplate,
    });

    const headsTask = new DagTask('heads', {
        depends: flipCoinTask,
        template: headsTemplate,
        whenExpression: equals(simpleTag({ dagTask: flipCoinTask, output: new OutputResult() }), 'heads'),
    });
    const tailsTask = new DagTask('tails', {
        depends: flipCoinTask,
        template: tailsTemplate,
        whenExpression: equals(simpleTag({ dagTask: flipCoinTask, output: new OutputResult() }), 'tails'),
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [flipCoinTask, headsTask, tailsTask],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('result', {
                    fromExpression: ternary(
                        equals(hyphenateExpressionArgs({ dagTask: flipCoinTask, output: new OutputResult() }), 'heads'),
                        hyphenateExpressionArgs({ dagTask: headsTask, output: resultArtifact }),
                        hyphenateExpressionArgs({ dagTask: tailsTask, output: resultArtifact }),
                    ).toString(),
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    "Conditional artifacts provides a way to choose the output artifacts based on an expression.\n\nIn this example the DAG template has two tasks which will run conditionall using `when`.\n\nBased on the condition one of steps may not execute. The step template output's artifact will be set to the\nexecuted step's output artifacts.\n",
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'dag-conditional-artifacts-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
