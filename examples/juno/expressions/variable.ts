import { Arguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../../../src/api/expressions/tag';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const variableParamTest = new InputParameter('variable-param');

    const variableTemplate = new Template('variable', {
        inputs: new Inputs({
            parameters: [variableParamTest],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(variableParamTest)}" != "84" ]; then exit 12; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('variable-task', {
                    arguments: new Arguments({
                        parameters: [
                            // juno doesn't support variables natively, so we use string interpolation instead
                            variableParamTest.toArgumentParameter({
                                value: `{{=let x = 42; x * 2}}`,
                            }),
                            // argo workflows does not support the $env keyword
                            // envParamTest.toArgumentParameter({
                            //     value: `{{=$env}}`,
                            // }),
                        ],
                    }),
                    template: variableTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways variable expressions can be used.\n`,
            },
            generateName: 'variable-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
