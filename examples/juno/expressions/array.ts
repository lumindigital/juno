import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import {
    all,
    any,
    arrayConcat,
    arrayMap,
    count,
    filter,
    find,
    findIndex,
    findLast,
    findLastIndex,
    first,
    flatten,
    groupBy,
    join,
    last,
    mean,
    median,
    none,
    one,
    reduce,
    reverse,
    sort,
    sortBy,
    sum,
    take,
    uniq,
} from '../../../src/api/expressions/array';
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
    const meanParam = new InputParameter('mean-param');
    const medianParam = new InputParameter('median-param');
    const takeParam = new InputParameter('take-param');
    const allParam = new InputParameter('all-param');
    const anyParam = new InputParameter('any-param');
    const oneParam = new InputParameter('one-param');
    const noneParam = new InputParameter('none-param');
    const mapParam = new InputParameter('map-param');
    const filterParam = new InputParameter('filter-param');
    const findParam = new InputParameter('find-param');
    const findIndexParam = new InputParameter('find-index-param');
    const findLastParam = new InputParameter('find-last-param');
    const findLastIndexParam = new InputParameter('find-last-index-param');
    const groupByParam = new InputParameter('group-by-param');
    const countParam = new InputParameter('count-param');
    const reduceParam = new InputParameter('reduce-param');
    const sumParam = new InputParameter('sum-param');
    const sortByParam = new InputParameter('sort-by-param');

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
                meanParam,
                medianParam,
                takeParam,
                allParam,
                anyParam,
                oneParam,
                noneParam,
                mapParam,
                filterParam,
                findParam,
                findIndexParam,
                findLastParam,
                findLastIndexParam,
                groupByParam,
                countParam,
                reduceParam,
                sumParam,
                sortByParam,
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
                     echo "mean: ${simpleTag(meanParam)}"
                     echo "median: ${simpleTag(medianParam)}"
                     echo "take: ${simpleTag(takeParam)}"
                     echo "all: ${simpleTag(allParam)}"
                     echo "any: ${simpleTag(anyParam)}"
                     echo "one: ${simpleTag(oneParam)}"
                     echo "none: ${simpleTag(noneParam)}"
                     echo "map: ${simpleTag(mapParam)}"
                     echo "filter: ${simpleTag(filterParam)}"
                     echo "find: ${simpleTag(findParam)}"
                     echo "findIndex: ${simpleTag(findIndexParam)}"
                     echo "findLast: ${simpleTag(findLastParam)}"
                     echo "findLastIndex: ${simpleTag(findLastIndexParam)}"
                     echo "groupBy: ${simpleTag(groupByParam)}"
                     echo "count: ${simpleTag(countParam)}"
                     echo "reduce: ${simpleTag(reduceParam)}"
                     echo "sum: ${simpleTag(sumParam)}"
                     echo "sortBy: ${simpleTag(sortByParam)}"
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
                            meanParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    mean(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
                                ),
                            }),
                            medianParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    median(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
                                ),
                            }),
                            takeParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    take(fromJson(hyphenateExpressionArgs(workflowArrayParam)), 2),
                                ),
                            }),
                            allParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    all(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# > 0}'),
                                ),
                            }),
                            anyParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    any(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# > 2}'),
                                ),
                            }),
                            oneParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    one(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# == 3}'),
                                ),
                            }),
                            noneParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    none(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# < 0}'),
                                ),
                            }),
                            mapParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    arrayMap(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# * 2}'),
                                ),
                            }),
                            filterParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    filter(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# > 1}'),
                                ),
                            }),
                            findParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    find(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# > 1}'),
                                ),
                            }),
                            findIndexParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    findIndex(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# > 1}'),
                                ),
                            }),
                            findLastParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    findLast(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# > 1}'),
                                ),
                            }),
                            findLastIndexParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    findLastIndex(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# > 1}'),
                                ),
                            }),
                            groupByParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    groupBy(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# % 2}'),
                                ),
                            }),
                            countParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    count(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{# > 1}'),
                                ),
                            }),
                            reduceParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    reduce(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{#acc + #}', '0'),
                                ),
                            }),
                            sumParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    sum(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
                                ),
                            }),
                            sortByParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    sortBy(fromJson(hyphenateExpressionArgs(workflowArrayParam))),
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
