import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const retryScriptTemplate = new Template('retry-script', {
        retryStrategy: {
            limit: '10',
        },
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import random;
import sys;
exit_code = random.choice([0, 1, 1]);
sys.exit(exit_code)
`,
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'retry-script-',
        },
        spec: new WorkflowSpec({
            entrypoint: retryScriptTemplate,
        }),
    }).toWorkflow();
}
