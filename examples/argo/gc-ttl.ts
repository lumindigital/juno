import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'gc-ttl-',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
            ttlStrategy: {
                secondsAfterCompletion: 10,
                secondsAfterFailure: 5,
                secondsAfterSuccess: 5,
            },
        }),
    }).toWorkflow();
}
