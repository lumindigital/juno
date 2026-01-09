import { WorkflowArguments } from '../../src/api/arguments';
import { EnvironmentVariable } from '../../src/api/environment-variable';
import { jsonPath } from '../../src/api/expressions/json-path';
import { expressionTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const configWorkflowParameter = new WorkflowParameter('config', {
        value: '{"a": "1", "b": "2", "c": "3"}',
    });

    const aInputParameter = new InputParameter('a', {
        valueFromExpressionTag: expressionTag(jsonPath(configWorkflowParameter, '$.a')),
    });
    const bInputParameter = new InputParameter('b', {
        valueFromExpressionTag: expressionTag(jsonPath(configWorkflowParameter, '$.b')),
    });
    const cInputParameter = new InputParameter('c', {
        valueFromExpressionTag: expressionTag(jsonPath(configWorkflowParameter, '$.c')),
    });

    const mainTemplate = new Template('main', {
        inputs: new Inputs({
            parameters: [aInputParameter, bInputParameter, cInputParameter],
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
                parameters: [configWorkflowParameter],
            }),
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
