import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const sleepTemplate = new Template('sleep', {
        container: new Container({
            command: ['sh', '-c', 'sleep 10'],
            image: 'alpine:latest',
        }),
    });

    const parallelismTemplateLimitTemplate = new Template('parallelism-template-limit', {
        parallelism: 2,
        steps: [
            [
                new WorkflowStep('sleep', {
                    template: sleepTemplate,
                    withItems: ['this', 'workflow', 'should', 'take', 'at', 'least', 60, 'seconds', 'to', 'complete'],
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'parallelism-template-limit-',
        },
        spec: new WorkflowSpec({
            entrypoint: parallelismTemplateLimitTemplate,
        }),
    }).toWorkflow();
}
