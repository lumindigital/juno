import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { UserContainer } from '../src/api/user-container';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const sidecarNginxExampleTemplate = new Template('sidecar-nginx-example', {
        container: new Container({
            args: ["until `curl -G 'http://127.0.0.1/' >& /tmp/out`; do echo sleep && sleep 1; done && cat /tmp/out"],
            command: ['sh', '-c'],
            image: 'appropriate/curl',
        }),
        sidecars: [
            new UserContainer('nginx', {
                command: ['nginx', '-g', 'daemon off;'],
                image: 'nginx:1.13',
            }),
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'sidecar-nginx-',
        },
        spec: new WorkflowSpec({
            entrypoint: sidecarNginxExampleTemplate,
        }),
    }).toWorkflow();
}
