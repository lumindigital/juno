import { WorkflowArguments } from '../../src/api/arguments';
import { EnvironmentVariable } from '../../src/api/environment-variable';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowParameter } from '../../src/api/parameter';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const aInputParameter = new InputParameter('a', {
        value: '{{=jsonpath(workflow.parameters.config, \'$.employees[?(@.name=="Baris")].age\')}}',
    });
    const bInputParameter = new InputParameter('b', {
        value: "{{=jsonpath(workflow.parameters.config, '$.employees[?(@.age>42 && @.age<44)].age')}}",
    });
    const cInputParameter = new InputParameter('c', {
        value: "{{=jsonpath(workflow.parameters.config, '$.employees[0:1]')}}",
    });
    const dInputParameter = new InputParameter('d', {
        value: "{{=jsonpath(workflow.parameters.config, '$.employees[*].name')}}",
    });

    const mainTemplate = new Template('main', {
        inputs: new Inputs({
            parameters: [aInputParameter, bInputParameter, cInputParameter, dInputParameter],
        }),
        script: new Script({
            command: ['bash'],
            env: [
                new EnvironmentVariable('A', {
                    valueFromInputParameter: aInputParameter,
                }),
                new EnvironmentVariable('B', {
                    valueFromInputParameter: bInputParameter,
                }),
                new EnvironmentVariable('C', {
                    valueFromInputParameter: cInputParameter,
                }),
                new EnvironmentVariable('D', {
                    valueFromInputParameter: dInputParameter,
                }),
            ],
            image: 'debian:9.4',
            source: 'echo "$A$B$C$D"\n',
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'expression-destructure-json-complex-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('config', {
                        value: '{"employees": [{"name": "Baris", "age":43},{"name": "Mo", "age": 42}, {"name": "Jai", "age" :44}]}',
                    }),
                ],
            }),
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
