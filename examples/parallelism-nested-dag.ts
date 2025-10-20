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

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const msgInputParameter = new InputParameter('msg');

    const oneJobTemplate = new Template('one-job', {
        container: new Container({
            args: ['echo {{inputs.parameters.msg}}; sleep 10'],
            command: ['/bin/sh', '-c'],
            image: 'alpine',
        }),
        inputs: new Inputs({
            parameters: [msgInputParameter],
        }),
    });

    const bTemplate = new Template('B', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('c1', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '{{inputs.parameters.msg}} c1' })],
                    }),
                    template: oneJobTemplate,
                }),
                new DagTask('c2', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '{{inputs.parameters.msg}} c2' })],
                    }),
                    depends: 'c1',
                    template: oneJobTemplate,
                }),
                new DagTask('c3', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '{{inputs.parameters.msg}} c3' })],
                    }),
                    depends: 'c1',
                    template: oneJobTemplate,
                }),
            ],
        }),
        inputs: new Inputs({
            parameters: [msgInputParameter],
        }),
    });

    const aTemplate = new Template('A', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('b1', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '1' })],
                    }),
                    template: bTemplate,
                }),
                new DagTask('b2', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '2' })],
                    }),
                    depends: 'b1',
                    template: bTemplate,
                }),
                new DagTask('b3', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '3' })],
                    }),
                    depends: 'b1',
                    template: bTemplate,
                }),
                new DagTask('b4', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '4' })],
                    }),
                    depends: 'b1',
                    template: bTemplate,
                }),
                new DagTask('b5', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '5' })],
                    }),
                    depends: 'b2 && b3 && b4',
                    template: bTemplate,
                }),
            ],
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
