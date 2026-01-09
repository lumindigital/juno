import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const errorContainerTemplate = new Template('error-container', {
        container: new Container({
            args: ['import random; import sys; exit_code = random.choice(range(0, 5)); sys.exit(exit_code)'],
            command: ['python', '-c'],
            image: 'python',
        }),
        retryStrategy: {
            limit: '2',
            retryPolicy: 'Always',
        },
    });

    return new Workflow({
        metadata: {
            generateName: 'retry-on-error-',
        },
        spec: new WorkflowSpec({
            entrypoint: errorContainerTemplate,
        }),
    }).toWorkflow();
}
