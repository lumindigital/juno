import { Container } from '../../src/api/container';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { InlineTemplate, Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('a', {
                    inline: new InlineTemplate({
                        container: new Container({
                            image: 'argoproj/argosay:v2',
                        }),
                    }),
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': 'This example demonstrates running a DAG with inline templates.\n',
                'workflows.argoproj.io/version': '>= 3.2.0',
            },
            generateName: 'dag-inline-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
