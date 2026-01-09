import { InputArtifact } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const rawContentsTemplate = new Template('raw-contents', {
        container: new Container({
            args: ['cat /tmp/file'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('myfile', {
                    path: '/tmp/file',
                    raw: {
                        data: 'this is\nthe raw file\ncontents\n',
                    },
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'input-artifact-raw-',
        },
        spec: new WorkflowSpec({
            entrypoint: rawContentsTemplate,
        }),
    }).toWorkflow();
}
