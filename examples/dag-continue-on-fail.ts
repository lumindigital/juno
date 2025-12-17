import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';
import { and, TaskResult } from '../src/api/expression';

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

    const taskA = new DagTask('A', {
        template: helloWorldTemplate,
    });
    const taskB = new DagTask('B', {
        depends: taskA,
        template: intentionalFailTemplate,
    });
    const taskC = new DagTask('C', {
        depends: taskA,
        template: helloWorldTemplate,
    });
    const taskD = new DagTask('D', {
        depends: and([{ task: taskB, result: TaskResult.Failed }, taskC]),
        template: helloWorldTemplate,
    });
    const taskE = new DagTask('E', {
        depends: taskA,
        template: intentionalFailTemplate,
    });
    const taskF = new DagTask('F', {
        depends: taskA,
        template: helloWorldTemplate,
    });
    const taskG = new DagTask('G', {
        depends: and([taskE, taskF]),
        template: helloWorldTemplate,
    });

    const workflowTemplate = new Template('workflow', {
        dag: new DagTemplate({
            tasks: [taskA, taskB, taskC, taskD, taskE, taskF, taskG],
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
