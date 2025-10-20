import { ContainerSetTemplate } from '../../src/api/container-set-template';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        containerSet: new ContainerSetTemplate({
            containers: [
                {
                    image: 'argoproj/argosay:v2',
                    name: 'a',
                },
                {
                    dependencies: ['a'],
                    image: 'argoproj/argosay:v2',
                    name: 'b',
                },
                {
                    dependencies: ['a'],
                    image: 'argoproj/argosay:v2',
                    name: 'c',
                },
                {
                    dependencies: ['b', 'c'],
                    image: 'argoproj/argosay:v2',
                    name: 'd',
                },
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This workflow demonstrates running a graph of tasks within containers in a single pod.\n',
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'graph-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
