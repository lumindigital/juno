import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const sleepTemplate = new Template('sleep', {
        activeDeadlineSeconds: '10',
        container: new Container({
            args: ['echo 123; sleep 1d'],
            command: ['bash', '-c'],
            image: 'argoproj/argosay:v2',
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'timeouts-step-',
        },
        spec: new WorkflowSpec({
            entrypoint: sleepTemplate,
        }),
    }).toWorkflow();
}
