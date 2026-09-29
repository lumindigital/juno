import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import {
    jsonPath,
    WorkflowAnnotationsJson,
    WorkflowLabelsJson,
    WorkflowParametersJson,
} from '../../../src/api/expressions/json-path';
import { expressionTag, simpleTag } from '../../../src/api/expressions/tag';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const simplePropertyParam = new InputParameter('simple-property-param');
    const nestedPropertyParam = new InputParameter('nested-property-param');
    const arrayElementParam = new InputParameter('array-element-param');
    const workflowParamsJsonParam = new InputParameter('workflow-params-json-param');
    const workflowAnnotationsJsonParam = new InputParameter('workflow-annotations-json-param');
    const workflowLabelsJsonParam = new InputParameter('workflow-labels-json-param');

    const workflowJsonParam = new WorkflowParameter('workflow-json-param', {
        value: '{"name":"test","nested":{"key":"deep-value"},"items":["a","b","c"]}',
    });

    const jsonPathTemplate = new Template('json-path', {
        inputs: new Inputs({
            parameters: [
                simplePropertyParam,
                nestedPropertyParam,
                arrayElementParam,
                workflowParamsJsonParam,
                workflowAnnotationsJsonParam,
                workflowLabelsJsonParam,
            ],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(simplePropertyParam)}" != "test" ]; then echo "simple property failed: got '${simpleTag(simplePropertyParam)}'"; exit 11; fi
if [ "${simpleTag(nestedPropertyParam)}" != "deep-value" ]; then echo "nested property failed: got '${simpleTag(nestedPropertyParam)}'"; exit 12; fi
if [ "${simpleTag(arrayElementParam)}" != "a" ]; then echo "array element failed: got '${simpleTag(arrayElementParam)}'"; exit 13; fi
if [ "${simpleTag(workflowParamsJsonParam)}" != "workflow-json-param" ]; then echo "workflow params json failed: got '${simpleTag(workflowParamsJsonParam)}'"; exit 14; fi
if [ "${simpleTag(workflowAnnotationsJsonParam)}" != "This is an example of the ways jsonPath expressions can be used.
" ]; then echo "workflow annotations json failed: got '${simpleTag(workflowAnnotationsJsonParam)}'"; exit 15; fi
if [ "${simpleTag(workflowLabelsJsonParam)}" != "false" ]; then echo "workflow labels json failed: got '${simpleTag(workflowLabelsJsonParam)}'"; exit 16; fi
echo "All jsonPath function tests passed"
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('json-path-task', {
                    arguments: new Arguments({
                        parameters: [
                            simplePropertyParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(jsonPath(workflowJsonParam, '$.name')),
                            }),
                            nestedPropertyParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(jsonPath(workflowJsonParam, '$.nested.key')),
                            }),
                            arrayElementParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(jsonPath(workflowJsonParam, '$.items[0]')),
                            }),
                            workflowParamsJsonParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    jsonPath(new WorkflowParametersJson(), '$[0].name'),
                                ),
                            }),
                            workflowAnnotationsJsonParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    jsonPath(new WorkflowAnnotationsJson(), '$["workflows.argoproj.io/description"]'),
                                ),
                            }),
                            workflowLabelsJsonParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    jsonPath(new WorkflowLabelsJson(), '$["workflows.argoproj.io/archive-strategy"]'),
                                ),
                            }),
                        ],
                    }),
                    template: jsonPathTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways jsonPath expressions can be used.\n`,
            },
            generateName: 'json-path-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [workflowJsonParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
