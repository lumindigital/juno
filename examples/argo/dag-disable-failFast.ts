import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const aTemplate = new Template('a', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    const bTemplate = new Template('b', {
        container: new Container({
            args: ['sleep 30; echo haha'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        retryStrategy: {
            limit: '2',
        },
    });

    const cTemplate = new Template('c', {
        container: new Container({
            args: ['echo intentional failure; exit 2'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        retryStrategy: {
            limit: '3',
        },
    });

    const dTemplate = new Template('d', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    const taskA = new DagTask('A', {
        template: aTemplate,
    });
    const taskB = new DagTask('B', {
        dependsExpression: taskA,
        template: bTemplate,
    });
    const taskC = new DagTask('C', {
        dependsExpression: taskA,
        template: cTemplate,
    });
    const taskD = new DagTask('D', {
        dependsExpression: taskB,
        template: dTemplate,
    });
    const taskE = new DagTask('E', {
        dependsExpression: taskD,
        template: dTemplate,
    });

    const statisTemplate = new Template('statis', {
        dag: new DagTemplate({
            failFast: false,
            tasks: [taskA, taskB, taskC, taskD, taskE],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-primay-branch-',
        },
        spec: new WorkflowSpec({
            entrypoint: statisTemplate,
        }),
    }).toWorkflow();
}
