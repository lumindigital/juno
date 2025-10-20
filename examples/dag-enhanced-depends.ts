import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const passTemplate = new Template('pass', {
        container: new Container({
            command: ['sh', '-c', 'exit 0'],
            image: 'alpine:3.7',
        }),
    });

    const failTemplate = new Template('fail', {
        container: new Container({
            command: ['sh', '-c', 'exit 1'],
            image: 'alpine:3.7',
        }),
    });

    const diamondTemplate = new Template('diamond', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('A', {
                    template: passTemplate,
                }),
                new DagTask('B', {
                    depends: 'A',
                    template: passTemplate,
                }),
                new DagTask('C', {
                    depends: 'A',
                    template: failTemplate,
                }),
                new DagTask('should-execute-1', {
                    depends: 'A && (C.Succeeded || C.Failed)',
                    template: passTemplate,
                }),
                new DagTask('should-execute-2', {
                    depends: 'B || C',
                    template: passTemplate,
                }),
                new DagTask('should-not-execute', {
                    depends: 'B && C',
                    template: passTemplate,
                }),
                new DagTask('should-execute-3', {
                    depends: 'should-execute-2.Succeeded || should-not-execute',
                    template: passTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-diamond-',
        },
        spec: new WorkflowSpec({
            entrypoint: diamondTemplate,
        }),
    }).toWorkflow();
}
