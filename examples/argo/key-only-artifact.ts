import { InputArtifact, OutputArtifact } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Inputs } from '../../src/api/inputs';
import { Outputs } from '../../src/api/outputs';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const generateTemplate = new Template('generate', {
        container: new Container({
            args: ['echo', 'hello', '/mnt/file'],
            image: 'argoproj/argosay:v2',
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('file', {
                    path: '/mnt/file',
                    s3: {
                        key: 'my-file',
                    },
                }),
            ],
        }),
    });

    const consumeTemplate = new Template('consume', {
        container: new Container({
            args: ['cat', '/tmp/file'],
            image: 'argoproj/argosay:v2',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('file', {
                    path: '/tmp/file',
                    s3: {
                        key: 'my-file',
                    },
                }),
            ],
        }),
    });

    const generateTask = new DagTask('generate', {
        template: generateTemplate,
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [
                generateTask,
                new DagTask('consume', {
                    depends: generateTask,
                    template: consumeTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'key-only-artifacts-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
