import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../../../src/api/expressions/tag';
import { jsonPath } from '../../../src/api/expressions/json-path';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const arraySliceParamTest = new InputParameter('array-slice-param');

    const arrayParam = new WorkflowParameter('workflow-array-param', { value: '{"count":["one", "two", "three"]}' });

    const sliceTemplate = new Template('slice', {
        inputs: new Inputs({
            parameters: [arraySliceParamTest],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(arraySliceParamTest)}" != "[one,two]" ]; then exit 12; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('slice-task', {
                    arguments: new Arguments({
                        parameters: [
                            // You have to convert the json string into a json object first before accessing properties
                            // juno doesn't support slices natively, so we use string interpolation instead
                            arraySliceParamTest.toArgumentParameter({
                                value: `{{=${jsonPath(arrayParam, '$.count')}[0:2]}}`,
                            }),
                        ],
                    }),
                    template: sliceTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways slice expressions can be used.\n`,
            },
            generateName: 'slice-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [arrayParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
