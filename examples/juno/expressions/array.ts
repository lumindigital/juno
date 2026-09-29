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
import { fromJson, toPairs } from '../../../src/api/expressions/cast';
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

    const workflowArrayStringParam = new WorkflowParameter('workflow-array-string-param', {
        value: '["3","1","2","1"]',
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
            source: `if [ "${simpleTag(firstParam)}" != "3" ]; then echo "first failed: got '${simpleTag(firstParam)}'"; exit 11; fi
if [ "${simpleTag(lastParam)}" != "1" ]; then echo "last failed: got '${simpleTag(lastParam)}'"; exit 12; fi
if [ "${simpleTag(flattenParam)}" != "[1,2,3,4]" ]; then echo "flatten failed: got '${simpleTag(flattenParam)}'"; exit 13; fi
if [ "${simpleTag(reverseParam)}" != "[1,2,1,3]" ]; then echo "reverse failed: got '${simpleTag(reverseParam)}'"; exit 14; fi
if [ "${simpleTag(sortParam)}" != "[1,1,2,3]" ]; then echo "sort failed: got '${simpleTag(sortParam)}'"; exit 15; fi
if [ "${simpleTag(uniqParam)}" != "[3,1,2]" ]; then echo "uniq failed: got '${simpleTag(uniqParam)}'"; exit 16; fi
if [ "${simpleTag(joinParam)}" != "3, 1, 2, 1" ]; then echo "join failed: got '${simpleTag(joinParam)}'"; exit 17; fi
if [ "${simpleTag(concatParam)}" != "[3,1,2,1,5,6]" ]; then echo "concat failed: got '${simpleTag(concatParam)}'"; exit 18; fi
if [ "${simpleTag(meanParam)}" != "1.75" ]; then echo "mean failed: got '${simpleTag(meanParam)}'"; exit 19; fi
if [ "${simpleTag(medianParam)}" != "1.5" ]; then echo "median failed: got '${simpleTag(medianParam)}'"; exit 20; fi
if [ "${simpleTag(takeParam)}" != "[3,1]" ]; then echo "take failed: got '${simpleTag(takeParam)}'"; exit 21; fi
if [ "${simpleTag(allParam)}" != "true" ]; then echo "all failed: got '${simpleTag(allParam)}'"; exit 22; fi
if [ "${simpleTag(anyParam)}" != "true" ]; then echo "any failed: got '${simpleTag(anyParam)}'"; exit 23; fi
if [ "${simpleTag(oneParam)}" != "true" ]; then echo "one failed: got '${simpleTag(oneParam)}'"; exit 24; fi
if [ "${simpleTag(noneParam)}" != "true" ]; then echo "none failed: got '${simpleTag(noneParam)}'"; exit 25; fi
if [ "${simpleTag(mapParam)}" != "[6,2,4,2]" ]; then echo "map failed: got '${simpleTag(mapParam)}'"; exit 26; fi
if [ "${simpleTag(filterParam)}" != "[3,2]" ]; then echo "filter failed: got '${simpleTag(filterParam)}'"; exit 27; fi
if [ "${simpleTag(findParam)}" != "3" ]; then echo "find failed: got '${simpleTag(findParam)}'"; exit 28; fi
if [ "${simpleTag(findIndexParam)}" != "0" ]; then echo "findIndex failed: got '${simpleTag(findIndexParam)}'"; exit 29; fi
if [ "${simpleTag(findLastParam)}" != "2" ]; then echo "findLast failed: got '${simpleTag(findLastParam)}'"; exit 30; fi
if [ "${simpleTag(findLastIndexParam)}" != "2" ]; then echo "findLastIndex failed: got '${simpleTag(findLastIndexParam)}'"; exit 31; fi
if [ "${simpleTag(groupByParam)}" != "[["3",["3"]],["1",["1","1"]],["2",["2"]]]" ]; then echo "groupBy failed: got '${simpleTag(groupByParam)}'"; exit 32; fi
if [ "${simpleTag(countParam)}" != "2" ]; then echo "count failed: got '${simpleTag(countParam)}'"; exit 33; fi
if [ "${simpleTag(reduceParam)}" != "7" ]; then echo "reduce failed: got '${simpleTag(reduceParam)}'"; exit 34; fi
if [ "${simpleTag(sumParam)}" != "7" ]; then echo "sum failed: got '${simpleTag(sumParam)}'"; exit 35; fi
if [ "${simpleTag(sortByParam)}" != [1,1,2,3] ]; then echo "sortBy failed: got '${simpleTag(sortByParam)}'"; exit 36; fi
echo "All array function tests passed"
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
                                    join(fromJson(hyphenateExpressionArgs(workflowArrayStringParam)), ', '),
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
                                    toPairs(
                                        groupBy(fromJson(hyphenateExpressionArgs(workflowArrayStringParam)), '{#}'),
                                    ),
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
                                    sortBy(fromJson(hyphenateExpressionArgs(workflowArrayParam)), '{ # }'),
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
                parameters: [workflowArrayParam, workflowNestedParam, workflowArray2Param, workflowArrayStringParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
