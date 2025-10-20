import { EnvironmentVariable } from '../src/api/environment-variable';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowParameter } from '../src/api/parameter';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowArguments } from '../src/api/arguments';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const weekTempsInputParameter = new InputParameter('week-temps', {
        value: `{{=\n  map([\n      jsonpath(sprig.b64dec(jsonpath(workflow.parameters.weather, '$.weekWeather')), '$.temps')\n    ], {\n      toJson({\n        avg: sprig.add(#[0], #[1], #[2], #[3], #[4]) / 5,\n        min: sprig.min(#[0], #[1], #[2], #[3], #[4]),\n        max: sprig.max(#[0], #[1], #[2], #[3], #[4])\n      })\n  })[0]\n}}`,
    });

    const mainTemplate = new Template('main', {
        inputs: new Inputs({
            parameters: [weekTempsInputParameter],
        }),
        script: new Script({
            command: ['bash'],
            env: [
                new EnvironmentVariable('AVG', {
                    value: "{{=jsonpath(inputs.parameters['week-temps'], '$.avg')}}",
                }),
                new EnvironmentVariable('MIN', {
                    value: "{{=jsonpath(inputs.parameters['week-temps'], '$.min')}}",
                }),
                new EnvironmentVariable('MAX', {
                    value: "{{=jsonpath(inputs.parameters['week-temps'], '$.max')}}",
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
