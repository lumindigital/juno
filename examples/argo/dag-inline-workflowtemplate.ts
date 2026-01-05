import { Container } from '../../src/api/container';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { InlineTemplate, Template } from '../../src/api/template';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowTemplate } from '../../src/api/workflow-template';
import { IoArgoprojWorkflowV1Alpha1WorkflowTemplate } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1WorkflowTemplate> {
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

    return new WorkflowTemplate({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': 'This example demonstrates running a DAG with inline templates.\n',
                'workflows.argoproj.io/version': '>= 3.2.0',
            },
            name: 'dag-inline',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflowTemplate();
}
