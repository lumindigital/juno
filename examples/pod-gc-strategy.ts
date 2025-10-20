import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const failTemplate = new Template('fail', {
        container: new Container({
            args: ['exit 1'],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
    });

    const succeedTemplate = new Template('succeed', {
        container: new Container({
            args: ['exit 0'],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
    });

    const podGcStrategyTemplate = new Template('pod-gc-strategy', {
        steps: [
            [
                new WorkflowStep('fail', {
                    template: failTemplate,
                }),
                new WorkflowStep('succeed', {
                    template: succeedTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'pod-gc-strategy-',
        },
        spec: new WorkflowSpec({
            entrypoint: podGcStrategyTemplate,
            podGC: {
                deleteDelayDuration: '30s',
                strategy: 'OnPodSuccess',
            },
        }),
    }).toWorkflow();
}
