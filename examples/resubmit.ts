import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const randomFailTemplate = new Template('random-fail', {
        container: new Container({
            args: [
                "import random; import sys; exit_code = random.choice([0, 0, 1]); print('exiting with code {}'.format(exit_code)); sys.exit(exit_code)",
            ],
            command: ['python', '-c'],
            image: 'python:alpine3.6',
        }),
    });

    const randFailStepsTemplate = new Template('rand-fail-steps', {
        steps: [
            [
                new WorkflowStep('randfail1a', {
                    template: randomFailTemplate,
                }),
                new WorkflowStep('randfail1b', {
                    template: randomFailTemplate,
                }),
            ],
            [
                new WorkflowStep('randfail2a', {
                    template: randomFailTemplate,
                }),
                new WorkflowStep('randfail2b', {
                    template: randomFailTemplate,
                }),
                new WorkflowStep('randfail2c', {
                    template: randomFailTemplate,
                }),
                new WorkflowStep('randfail2d', {
                    template: randomFailTemplate,
                }),
            ],
        ],
    });

    const randFailDagTemplate = new Template('rand-fail-dag', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('A', {
                    template: randomFailTemplate,
                }),
                new DagTask('B', {
                    template: randFailStepsTemplate,
                }),
                new DagTask('C', {
                    depends: 'B',
                    template: randomFailTemplate,
                }),
                new DagTask('D', {
                    depends: 'A && B',
                    template: randomFailTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'resubmit-',
        },
        spec: new WorkflowSpec({
            entrypoint: randFailDagTemplate,
        }),
    }).toWorkflow();
}
