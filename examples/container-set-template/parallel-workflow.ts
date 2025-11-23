import { ContainerNode } from '../../src/api/container-node';
import { ContainerSetTemplate } from '../../src/api/container-set-template';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        containerSet: new ContainerSetTemplate({
            containers: [
                new ContainerNode('a', {
                    image: 'argoproj/argosay:v2',
                }),
                new ContainerNode('b', {
                    image: 'argoproj/argosay:v2',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This workflow demonstrates running a parallel containers within a single pod.\n',
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'parallel-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
