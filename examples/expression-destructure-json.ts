import { WorkflowArguments } from '../src/api/arguments';
import { EnvironmentVariable } from '../src/api/environment-variable';
import { Inputs } from '../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const aInputParameter = new InputParameter('a', {
        value: "{{=jsonpath(workflow.parameters.config, '$.a')}}",
    });
    const bInputParameter = new InputParameter('b', {
        value: "{{=jsonpath(workflow.parameters.config, '$.b')}}",
    });
    const cInputParameter = new InputParameter('c', {
        value: "{{=jsonpath(workflow.parameters.config, '$.c')}}",
    });

    const mainTemplate = new Template('main', {
        inputs: new Inputs({
            parameters: [aInputParameter, bInputParameter, cInputParameter],
        }),
        script: new Script({
            command: ['bash'],
            env: [
                new EnvironmentVariable('A', {
                    value: '{{inputs.parameters.a}}',
                }),
                new EnvironmentVariable('B', {
                    value: '{{inputs.parameters.b}}',
                }),
                new EnvironmentVariable('C', {
                    value: '{{inputs.parameters.c}}',
                }),
            ],
            image: 'debian:9.4',
            source: `echo "$A$B$C"
`,
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'expression-destructure-json-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('config', {
                        value: '{"a": "1", "b": "2", "c": "3"}',
                    }),
                ],
            }),
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
