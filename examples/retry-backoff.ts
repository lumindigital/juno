import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const retryBackoffTemplate = new Template('retry-backoff', {
        container: new Container({
            args: ['import random; import sys; exit_code = random.choice([0, 1, 1]); sys.exit(exit_code)'],
            command: ['python', '-c'],
            image: 'python:alpine3.6',
        }),
        retryStrategy: {
            backoff: {
                duration: '1',
                factor: '2',
                maxDuration: '1m',
            },
            limit: '10',
        },
    });

    return new Workflow({
        metadata: {
            generateName: 'retry-backoff-',
        },
        spec: new WorkflowSpec({
            entrypoint: retryBackoffTemplate,
        }),
    }).toWorkflow();
}
