import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { arrayConcat, first, flatten, join, last, reverse, sort, uniq } from '../../../src/api/expressions/array';
import { fromJson } from '../../../src/api/expressions/cast';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const firstParam = new InputParameter('first-param');
    const lastParam = new InputParameter('last-param');
    const flattenParam = new InputParameter('flatten-param');
    const reverseParam = new InputParameter('reverse-param');
    const sortParam = new InputParameter('sort-param');
    const uniqParam = new InputParameter('uniq-param');
    const joinParam = new InputParameter('join-param');
    const concatParam = new InputParameter('concat-param');

    const workflowArrayParam = new WorkflowParameter('workflow-array-param', {
        value: '[3,1,2,1]',
    });

    const workflowNestedParam = new WorkflowParameter('workflow-nested-param', {
        value: '[[1,2],[3,4]]',
    });

    const workflowArray2Param = new WorkflowParameter('workflow-array2-param', {
        value: '[5,6]',
    });

    const arrayTemplate = new Template('array', {
        inputs: new Inputs({
            parameters: [
                firstParam,
                lastParam,
                flattenParam,
                reverseParam,
                sortParam,
                uniqParam,
                joinParam,
                concatParam,
            ],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `echo "first: ${simpleTag(firstParam)}"
                     echo "last: ${simpleTag(lastParam)}"
                     echo "flatten: ${simpleTag(flattenParam)}"
                     echo "reverse: ${simpleTag(reverseParam)}"
                     echo "sort: ${simpleTag(sortParam)}"
                     echo "uniq: ${simpleTag(uniqParam)}"
                     echo "join: ${simpleTag(joinParam)}"
                     echo "concat: ${simpleTag(concatParam)}"
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('array-task', {
                    arguments: new Arguments({
                        parameters: [
                            firstParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    first(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
                                ),
                            }),
                            lastParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    last(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
                                ),
                            }),
                            flattenParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    flatten(fromJson(hyphenateExpressionArgs(workflowNestedParam))),
                                ),
                            }),
                            reverseParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    reverse(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
                                ),
                            }),
                            sortParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    sort(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
                                ),
                            }),
                            uniqParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    uniq(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
                                ),
                            }),
                            joinParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    join(fromJson(hyphenateExpressionArgs(workflowArrayParam)), ', '),
                                ),
                            }),
                            concatParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    arrayConcat(
                                        fromJson(hyphenateExpressionArgs(workflowArrayParam)),
                                        fromJson(hyphenateExpressionArgs(workflowArray2Param)),
                                    ),
                                ),
                            }),
                        ],
                    }),
                    template: arrayTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways array expressions can be used.\n`,
            },
            generateName: 'array-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [workflowArrayParam, workflowNestedParam, workflowArray2Param],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
