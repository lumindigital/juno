import { OutputResult } from '../../src/api/artifact';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { equals } from '../../src/api/expressions/comparison';
import { ternary } from '../../src/api/expressions/conditional';
import { simpleTag } from '../../src/api/expressions/tag';
import { hyphenateExpressionArgs } from '../../src/api/expressions/tag';
import { Outputs } from '../../src/api/outputs';
import { OutputParameter } from '../../src/api/parameter';
import { ParameterValueFrom } from '../../src/api/parameter-value-from';
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

    const flipCoinTask = new DagTask('flip-coin', {
        template: flipCoinTemplate,
    });

    const headsTask = new DagTask('heads', {
        dependsExpression: flipCoinTask,
        template: headsTemplate,
        whenExpression: equals(simpleTag({ dagTask: flipCoinTask, output: new OutputResult() }), 'heads'),
    });
    const tailsTask = new DagTask('tails', {
        dependsExpression: flipCoinTask,
        template: tailsTemplate,
        whenExpression: equals(simpleTag({ dagTask: flipCoinTask, output: new OutputResult() }), 'tails'),
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [flipCoinTask, headsTask, tailsTask],
        }),
        outputs: new Outputs({
            parameters: [
                new OutputParameter('stepresult', {
                    valueFrom: new ParameterValueFrom({
                        expressionFrom: ternary(
                            equals(
                                hyphenateExpressionArgs({ dagTask: flipCoinTask, output: new OutputResult() }),
                                'heads',
                            ),
                            hyphenateExpressionArgs({ dagTask: headsTask, output: new OutputResult() }),
                            hyphenateExpressionArgs({ dagTask: tailsTask, output: new OutputResult() }),
                        ),
                    }),
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    "Conditional parameters provide a way to choose the output parameters based on expression.\n\nIn this example DAG template has two task which will run conditionally based on `when`.\n\nBased on this condition one of task may not execute. The template's output parameter will be set to the\nexecuted taks's output result.\n",
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'dag-conditional-parameter-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
