import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { fromJson } from '../../../src/api/expressions/cast';
import { keys, values } from '../../../src/api/expressions/map';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const keysParam = new InputParameter('keys-param');
    const valuesParam = new InputParameter('values-param');

    const workflowJsonParam = new WorkflowParameter('workflow-json-param', {
        value: '{"name":"juno","version":"1"}',
    });

    const mapTemplate = new Template('map', {
        inputs: new Inputs({
            parameters: [keysParam, valuesParam],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(keysParam)}" != "" ]; then echo "keys failed: got '${simpleTag(keysParam)}'"; exit 11; fi
if [ "${simpleTag(valuesParam)}" != "" ]; then echo "values failed: got '${simpleTag(valuesParam)}'"; exit 12; fi
echo "All map function tests passed"
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('map-task', {
                    arguments: new Arguments({
                        parameters: [
                            keysParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    keys(fromJson(hyphenateExpressionArgs(workflowJsonParam))),
                                ),
                            }),
                            valuesParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    values(fromJson(hyphenateExpressionArgs(workflowJsonParam))),
                                ),
                            }),
                        ],
                    }),
                    template: mapTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways map expressions can be used.\n`,
            },
            generateName: 'map-',
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
