import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import { fromJson } from '../../../src/api/expressions/cast';
import { get, len } from '../../../src/api/expressions/misc';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const lenParam = new InputParameter('len-param');
    const getByIndexParam = new InputParameter('get-by-index-param');
    const getByKeyParam = new InputParameter('get-by-key-param');

    const workflowArrayParam = new WorkflowParameter('workflow-array-param', {
        value: '["one", "two", "three"]',
    });
    const workflowJsonParam = new WorkflowParameter('workflow-json-param', {
        value: '{"name":"juno","version":"1"}',
    });

    const miscTemplate = new Template('misc', {
        inputs: new Inputs({
            parameters: [lenParam, getByIndexParam, getByKeyParam],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(lenParam)}" != 3 ]; then exit 12; fi
                     if [ "${simpleTag(getByIndexParam)}" != "one" ]; then exit 13; fi
                     if [ "${simpleTag(getByKeyParam)}" != "juno" ]; then exit 14; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('misc-task', {
                    arguments: new Arguments({
                        parameters: [
                            lenParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    len(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
                                ),
                            }),
                            getByIndexParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    get(fromJson(hyphenateExpressionArgs(workflowArrayParam)), 0),
                                ),
                            }),
                            getByKeyParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    get(fromJson(hyphenateExpressionArgs(workflowJsonParam)), 'name'),
                                ),
                            }),
                        ],
                    }),
                    template: miscTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways misc expressions can be used.\n`,
            },
            generateName: 'misc-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [workflowArrayParam, workflowJsonParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
