import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const sleepTemplate = new Template('sleep', {
        container: new Container({
            command: ['sleep', '1d'],
            image: 'debian:9.5-slim',
        }),
    });

    const unschedulableTemplate = new Template('unschedulable', {
        container: new Container({
            image: 'alpine:latest',
        }),
        nodeSelector: {
            'beta.kubernetes.io/arch': 'no-such-arch',
        },
    });

    const bunchOfSleepsTemplate = new Template('bunch-of-sleeps', {
        steps: [
            [
                new WorkflowStep('sleep-one-day', {
                    template: sleepTemplate,
                    withItems: [1, 2, 3],
                }),
                new WorkflowStep('unschedulable', {
                    template: unschedulableTemplate,
                    withItems: [1, 2, 3],
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'timeouts-workflow-',
        },
        spec: new WorkflowSpec({
            activeDeadlineSeconds: 30,
            entrypoint: bunchOfSleepsTemplate,
        }),
    }).toWorkflow();
}
