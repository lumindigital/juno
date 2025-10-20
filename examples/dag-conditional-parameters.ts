import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Outputs } from '../src/api/outputs';
import { OutputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
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

    const flipCoinTask = new DagTask('flip-coin', {
        template: flipCoinTemplate,
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [
                flipCoinTask,
                new DagTask('heads', {
                    depends: flipCoinTask,
                    template: headsTemplate,
                    when: '{{tasks.flip-coin.outputs.result}} == heads',
                }),
                new DagTask('tails', {
                    depends: flipCoinTask,
                    template: tailsTemplate,
                    when: '{{tasks.flip-coin.outputs.result}} == tails',
                }),
            ],
        }),
        outputs: new Outputs({
            parameters: [
                new OutputParameter('stepresult', {
                    valueFrom: {
                        expression:
                            "tasks['flip-coin'].outputs.result == 'heads' ? tasks.heads.outputs.result : tasks.tails.outputs.result",
                    },
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
