import { ContainerNode } from '../../../src/api/container-node';
import { ContainerSetTemplate } from '../../../src/api/container-set-template';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const nodeA = new ContainerNode('a', {
        image: 'argoproj/argosay:v2',
    });
    const nodeB = new ContainerNode('b', {
        dependencies: [nodeA],
        image: 'argoproj/argosay:v2',
    });
    const nodeC = new ContainerNode('c', {
        dependencies: [nodeA],
        image: 'argoproj/argosay:v2',
    });
    const nodeD = new ContainerNode('d', {
        dependencies: [nodeB, nodeC],
        image: 'argoproj/argosay:v2',
    });

    const mainTemplate = new Template('main', {
        containerSet: new ContainerSetTemplate({
            containers: [nodeA, nodeB, nodeC, nodeD],
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
