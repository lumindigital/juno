import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const retryContainerTemplate = new Template('retry-container', {
        container: new Container({
            args: ['import random; import sys; exit_code = random.choice([0, 1, 1]); sys.exit(exit_code)'],
            command: ['python', '-c'],
            image: 'python:alpine3.6',
        }),
        retryStrategy: {
            limit: '10',
        },
    });

    return new Workflow({
        metadata: {
            generateName: 'retry-container-',
        },
        spec: new WorkflowSpec({
            entrypoint: retryContainerTemplate,
        }),
    }).toWorkflow();
}
