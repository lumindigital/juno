import { InputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const httpArtifactExampleTemplate = new Template('http-artifact-example', {
        container: new Container({
            args: ['kubectl version'],
            command: ['sh', '-c'],
            image: 'debian:9.4',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('kubectl', {
                    http: {
                        url: 'https://storage.googleapis.com/kubernetes-release/release/v1.8.0/bin/linux/amd64/kubectl',
                    },
                    mode: 755,
                    path: '/bin/kubectl',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'input-artifact-http-',
        },
        spec: new WorkflowSpec({
            entrypoint: httpArtifactExampleTemplate,
        }),
    }).toWorkflow();
}
