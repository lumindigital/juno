import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const failTemplate = new Template('fail', {
        container: new Container({
            args: ['exit 1'],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
        metadata: {
            labels: {
                'should-be-deleted': 'true',
            },
        },
    });

    const succeedDeletedTemplate = new Template('succeed-deleted', {
        container: new Container({
            args: ['exit 0'],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
        metadata: {
            labels: {
                'should-be-deleted': 'true',
            },
        },
    });

    const succeedNotDeletedTemplate = new Template('succeed-not-deleted', {
        container: new Container({
            args: ['exit 0'],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
        metadata: {
            labels: {
                'should-be-deleted': 'false',
            },
        },
    });

    const podGcStrategyWithLabelSelectorTemplate = new Template('pod-gc-strategy-with-label-selector', {
        steps: [
            [
                new WorkflowStep('fail', {
                    template: failTemplate,
                }),
                new WorkflowStep('succeed-deleted', {
                    template: succeedDeletedTemplate,
                }),
                new WorkflowStep('succeed-not-deleted', {
                    template: succeedNotDeletedTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'pod-gc-strategy-with-label-selector-',
        },
        spec: new WorkflowSpec({
            entrypoint: podGcStrategyWithLabelSelectorTemplate,
            podGC: {
                deleteDelayDuration: '30s',
                labelSelector: {
                    matchLabels: {
                        'should-be-deleted': 'true',
                    },
                },
                strategy: 'OnPodSuccess',
            },
        }),
    }).toWorkflow();
}
