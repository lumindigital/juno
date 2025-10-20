import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

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

    const statisTemplate = new Template('statis', {
        dag: new DagTemplate({
            failFast: false,
            tasks: [
                new DagTask('A', {
                    template: aTemplate,
                }),
                new DagTask('B', {
                    depends: 'A',
                    template: bTemplate,
                }),
                new DagTask('C', {
                    depends: 'A',
                    template: cTemplate,
                }),
                new DagTask('D', {
                    depends: 'B',
                    template: dTemplate,
                }),
                new DagTask('E', {
                    depends: 'D',
                    template: dTemplate,
                }),
            ],
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
