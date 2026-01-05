import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expression';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const randomFailTemplate = new Template('random-fail', {
        container: new Container({
            args: [
                `import random; import sys; print('retries: ${simpleTag('retries')}'); exit_code = random.choice([0, 1, 1]); sys.exit(exit_code)`,
            ],
            command: ['python', '-c'],
            image: 'python:alpine3.6',
        }),
        retryStrategy: {
            limit: '10',
        },
    });

    const retryWithStepsTemplate = new Template('retry-with-steps', {
        steps: [
            [
                new WorkflowStep('hello1', {
                    template: randomFailTemplate,
                }),
            ],
            [
                new WorkflowStep('hello2a', {
                    template: randomFailTemplate,
                }),
                new WorkflowStep('hello2b', {
                    template: randomFailTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'retry-with-steps-',
        },
        spec: new WorkflowSpec({
            entrypoint: retryWithStepsTemplate,
        }),
    }).toWorkflow();
}
