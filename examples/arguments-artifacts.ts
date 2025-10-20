import { WorkflowArguments } from '../src/api/arguments';
import { ArgumentArtifact, InputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const kubectlInputArtifact = new InputArtifact('kubectl', {
        mode: 755,
        path: '/usr/local/bin/kubectl',
    });

    const kubectlInputArtifactTemplate = new Template('kubectl-input-artifact', {
        container: new Container({
            args: ['kubectl version'],
            command: ['sh', '-c'],
            image: 'debian:9.4',
        }),
        inputs: new Inputs({
            artifacts: [kubectlInputArtifact],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'arguments-artifacts-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                artifacts: [
                    new ArgumentArtifact('kubectl', {
                        http: {
                            url: 'https://storage.googleapis.com/kubernetes-release/release/v1.8.0/bin/linux/amd64/kubectl',
                        },
                    }),
                ],
            }),
            entrypoint: kubectlInputArtifactTemplate,
        }),
    }).toWorkflow();
}
