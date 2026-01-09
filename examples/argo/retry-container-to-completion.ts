import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const retryToCompletionTemplate = new Template('retry-to-completion', {
        container: new Container({
            args: ['import random; import sys; exit_code = random.choice(range(0, 5)); sys.exit(exit_code)'],
            command: ['python', '-c'],
            image: 'python',
        }),
        retryStrategy: {},
    });

    return new Workflow({
        metadata: {
            generateName: 'retry-to-completion-',
        },
        spec: new WorkflowSpec({
            entrypoint: retryToCompletionTemplate,
        }),
    }).toWorkflow();
}
