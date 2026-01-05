import { Arguments } from '../../../src/api/arguments';
import { OutputResult } from '../../../src/api/artifact';
import { ContainerNode } from '../../../src/api/container-node';
import { ContainerSetTemplate } from '../../../src/api/container-set-template';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { simpleTag } from '../../../src/api/expression';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const groupTemplate = new Template('group', {
        containerSet: new ContainerSetTemplate({
            containers: [
                new ContainerNode('main', {
                    args: ['print("hi")\n'],
                    command: ['python', '-c'],
                    image: 'python:alpine3.6',
                }),
            ],
        }),
    });

    const xInputParameter = new InputParameter('x');

    const verifyTemplate = new Template('verify', {
        inputs: new Inputs({
            parameters: [xInputParameter],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `assert "${simpleTag(xInputParameter)}" == "hi"\n`,
        }),
    });

    const aTask = new DagTask('a', {
        template: groupTemplate,
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [
                aTask,
                new DagTask('b', {
                    arguments: new Arguments({
                        parameters: [
                            xInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: { dagTask: aTask, output: new OutputResult() },
                            }),
                        ],
                    }),
                    dependencies: [aTask],
                    template: verifyTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This workflow demonstrates collecting outputs (specifically the stdout result) from a pod.\n\nSpecifially, you must have a container named "main".\n',
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'outputs-result-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
