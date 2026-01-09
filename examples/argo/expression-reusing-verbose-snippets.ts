import { EnvironmentVariable } from '../../src/api/environment-variable';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowParameter } from '../../src/api/parameter';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowArguments } from '../../src/api/arguments';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { expressionTag } from '../../src/api/expressions/tag';
import { jsonPath } from '../../src/api/expressions/json-path';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const weekTempsInputParameter = new InputParameter('week-temps', {
        value: `{{=
  map([
      jsonpath(sprig.b64dec(jsonpath(workflow.parameters.weather, '$.weekWeather')), '$.temps')
    ], {
      toJson({
        avg: sprig.add(#[0], #[1], #[2], #[3], #[4]) / 5,
        min: sprig.min(#[0], #[1], #[2], #[3], #[4]),
        max: sprig.max(#[0], #[1], #[2], #[3], #[4])
      })
  })[0]
}}`,
    });

    const mainTemplate = new Template('main', {
        inputs: new Inputs({
            parameters: [weekTempsInputParameter],
        }),
        script: new Script({
            command: ['bash'],
            env: [
                new EnvironmentVariable('AVG', {
                    valueFromExpressionTag: expressionTag(jsonPath(weekTempsInputParameter, '$.avg')),
                }),
                new EnvironmentVariable('MIN', {
                    valueFromExpressionTag: expressionTag(jsonPath(weekTempsInputParameter, '$.min')),
                }),
                new EnvironmentVariable('MAX', {
                    valueFromExpressionTag: expressionTag(jsonPath(weekTempsInputParameter, '$.max')),
                }),
            ],
            image: 'debian:9.4',
            source: `echo "The week's average temperature was $AVG with a minimum of $MIN and a maximum of $MAX."\n`,
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'expression-reusing-verbose-snippets-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('weather', {
                        value: '{"weekWeather": "eyJ0ZW1wcyI6IFszNCwgMjcsIDE1LCA1NywgNDZdfQo="}',
                    }),
                ],
            }),
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
