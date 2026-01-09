import { InputArtifact } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const gitCloneTemplate = new Template('git-clone', {
        container: new Container({
            args: ['git status && ls && cat VERSION'],
            command: ['sh', '-c'],
            image: 'golang:1.10',
            workingDir: '/src',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('argo-source', {
                    git: {
                        repo: 'https://github.com/argoproj/argo-workflows.git',
                        revision: 'v2.1.1',
                    },
                    path: '/src',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'input-artifact-git-',
        },
        spec: new WorkflowSpec({
            entrypoint: gitCloneTemplate,
        }),
    }).toWorkflow();
}
