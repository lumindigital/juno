import { Arguments } from '../src/api/arguments';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';
import { and, simpleTag } from '../src/api/expression';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const msgInputParameter = new InputParameter('msg');

    const oneJobTemplate = new Template('one-job', {
        container: new Container({
            args: [`echo ${simpleTag(msgInputParameter)}; sleep 10`],
            command: ['/bin/sh', '-c'],
            image: 'alpine',
        }),
        inputs: new Inputs({
            parameters: [msgInputParameter],
        }),
    });

    const c1Task = new DagTask('c1', {
        arguments: new Arguments({
            parameters: [msgInputParameter.toArgumentParameter({ value: `${simpleTag(msgInputParameter)} c1` })],
        }),
        template: oneJobTemplate,
    });
    const c2Task = new DagTask('c2', {
        arguments: new Arguments({
            parameters: [msgInputParameter.toArgumentParameter({ value: `${simpleTag(msgInputParameter)} c2` })],
        }),
        depends: c1Task,
        template: oneJobTemplate,
    });
    const c3Task = new DagTask('c3', {
        arguments: new Arguments({
            parameters: [msgInputParameter.toArgumentParameter({ value: `${simpleTag(msgInputParameter)} c3` })],
        }),
        depends: c1Task,
        template: oneJobTemplate,
    });

    const bTemplate = new Template('B', {
        dag: new DagTemplate({
            tasks: [c1Task, c2Task, c3Task],
        }),
        inputs: new Inputs({
            parameters: [msgInputParameter],
        }),
    });

    const b1Task = new DagTask('b1', {
        arguments: new Arguments({
            parameters: [msgInputParameter.toArgumentParameter({ value: '1' })],
        }),
        template: bTemplate,
    });
    const b2Task = new DagTask('b2', {
        arguments: new Arguments({
            parameters: [msgInputParameter.toArgumentParameter({ value: '2' })],
        }),
        depends: b1Task,
        template: bTemplate,
    });
    const b3Task = new DagTask('b3', {
        arguments: new Arguments({
            parameters: [msgInputParameter.toArgumentParameter({ value: '3' })],
        }),
        depends: b1Task,
        template: bTemplate,
    });
    const b4Task = new DagTask('b4', {
        arguments: new Arguments({
            parameters: [msgInputParameter.toArgumentParameter({ value: '4' })],
        }),
        depends: b1Task,
        template: bTemplate,
    });
    const b5Task = new DagTask('b5', {
        arguments: new Arguments({
            parameters: [msgInputParameter.toArgumentParameter({ value: '5' })],
        }),
        depends: and([b2Task, b3Task, b4Task]),
        template: bTemplate,
    });

    const aTemplate = new Template('A', {
        dag: new DagTemplate({
            tasks: [b1Task, b2Task, b3Task, b4Task, b5Task],
        }),
        parallelism: 2,
    });

    return new Workflow({
        metadata: {
            generateName: 'parallelism-nested-dag-',
        },
        spec: new WorkflowSpec({
            entrypoint: aTemplate,
        }),
    }).toWorkflow();
}
