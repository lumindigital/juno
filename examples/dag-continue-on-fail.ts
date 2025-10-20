import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    const intentionalFailTemplate = new Template('intentional-fail', {
        container: new Container({
            args: ['echo intentional failure; exit 1'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
    });

    const workflowTemplate = new Template('workflow', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('A', {
                    template: helloWorldTemplate,
                }),
                new DagTask('B', {
                    depends: 'A',
                    template: intentionalFailTemplate,
                }),
                new DagTask('C', {
                    depends: 'A',
                    template: helloWorldTemplate,
                }),
                new DagTask('D', {
                    depends: 'B.Failed && C',
                    template: helloWorldTemplate,
                }),
                new DagTask('E', {
                    depends: 'A',
                    template: intentionalFailTemplate,
                }),
                new DagTask('F', {
                    depends: 'A',
                    template: helloWorldTemplate,
                }),
                new DagTask('G', {
                    depends: 'E && F',
                    template: helloWorldTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-contiue-on-fail-',
        },
        spec: new WorkflowSpec({
            entrypoint: workflowTemplate,
        }),
    }).toWorkflow();
}
