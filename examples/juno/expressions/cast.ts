import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import {
    asFloat,
    asInt,
    asString,
    asType,
    fromBase64,
    fromJson,
    toBase64,
    toJson,
    toPairs,
} from '../../../src/api/expressions/cast';
import { jsonPath } from '../../../src/api/expressions/json-path';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';
import { equals } from '../../../src/api/expressions/comparison';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const intParam = new InputParameter('int-param');
    const floatParam = new InputParameter('float-param');
    const jsonParam = new InputParameter('json-param');
    const stringIntParam = new InputParameter('string-int-param');
    const toJsonParam = new InputParameter('to-json-param');
    const fromJsonParam = new InputParameter('from-json-param');
    const typeParam = new InputParameter('type-param');
    const toBase64Param = new InputParameter('to-base64-param');
    const fromBase64Param = new InputParameter('from-base64-param');
    const toPairsParam = new InputParameter('to-pairs-param');
    const castLiteralStringParam = new InputParameter('cast-literal-string-param');

    const workflowIntParam = new WorkflowParameter('workflow-int-param', { value: '1' });
    const workflowFloatParam = new WorkflowParameter('workflow-float-param', { value: '1.5' });
    const workflowJsonParam = new WorkflowParameter('workflow-json-param', { value: '{"isTrue":"true"}' });
    const workflowBase64Param = new WorkflowParameter('workflow-base64-param', { value: 'eyJpc1RydWUiOiJ0cnVlIn0=' });

    const castTemplate = new Template('cast', {
        inputs: new Inputs({
            parameters: [
                intParam,
                floatParam,
                jsonParam,
                stringIntParam,
                toJsonParam,
                fromJsonParam,
                typeParam,
                toBase64Param,
                fromBase64Param,
                toPairsParam,
                castLiteralStringParam,
            ],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(intParam)}" != "true" ]; then echo "asInt failed: got '${simpleTag(intParam)}'"; exit 12; fi
if [ "${simpleTag(floatParam)}" != "true" ]; then echo "asFloat failed: got '${simpleTag(floatParam)}'"; exit 13; fi
if [ "${simpleTag(jsonParam)}" != "true" ]; then echo "jsonPath failed: got '${simpleTag(jsonParam)}'"; exit 14; fi
if [ "${simpleTag(castLiteralStringParam)}" != "true" ]; then echo "asString literal failed: got '${simpleTag(castLiteralStringParam)}'"; exit 16; fi
if [ "${simpleTag(toJsonParam)}" != "{\\"isTrue\\":\\"true\\"}" ]; then echo "toJson failed: got '${simpleTag(toJsonParam)}'"; exit 17; fi
if [ "${simpleTag(fromJsonParam)}" != "{"isTrue":"true"}" ]; then echo "fromJson failed: got '${simpleTag(fromJsonParam)}'"; exit 18; fi
if [ "${simpleTag(typeParam)}" != "string" ]; then echo "asType failed: got '${simpleTag(typeParam)}'"; exit 19; fi
if [ "${simpleTag(toBase64Param)}" != "eyJpc1RydWUiOiJ0cnVlIn0=" ]; then echo "toBase64 failed: got '${simpleTag(toBase64Param)}'"; exit 20; fi
if [ "${simpleTag(fromBase64Param)}" != "{"isTrue":"true"}" ]; then echo "fromBase64 failed: got '${simpleTag(fromBase64Param)}'"; exit 21; fi
if [ "${simpleTag(toPairsParam)}" != "[["isTrue","true"]]" ]; then echo "toPairs failed: got '${simpleTag(toPairsParam)}'"; exit 22; fi
echo "All cast tests passed"
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('cast-task', {
                    arguments: new Arguments({
                        parameters: [
                            intParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    equals(asInt(hyphenateExpressionArgs(workflowIntParam)), 1),
                                ),
                            }),
                            floatParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    equals(asFloat(hyphenateExpressionArgs(workflowFloatParam)), 1.5),
                                ),
                            }),
                            // workflow parameters that are valid json are automatically converted to json to toJson is not required here
                            jsonParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    equals(jsonPath(workflowJsonParam, '$.isTrue'), 'true'),
                                ),
                            }),
                            stringIntParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    asString(hyphenateExpressionArgs(workflowIntParam)),
                                ),
                            }),
                            toJsonParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    toJson(hyphenateExpressionArgs(workflowJsonParam)),
                                ),
                            }),
                            fromJsonParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    fromJson(hyphenateExpressionArgs(workflowJsonParam)),
                                ),
                            }),
                            typeParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    asType(hyphenateExpressionArgs(workflowIntParam)),
                                ),
                            }),
                            toBase64Param.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    toBase64(hyphenateExpressionArgs(workflowJsonParam)),
                                ),
                            }),
                            fromBase64Param.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    fromBase64(hyphenateExpressionArgs(workflowBase64Param)),
                                ),
                            }),
                            toPairsParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    toPairs(fromJson(hyphenateExpressionArgs(workflowJsonParam))),
                                ),
                            }),
                            // using asString to cast a literal number to string
                            castLiteralStringParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(equals(asString(1), '1')),
                            }),
                            // There doesn't seem to be a valid way to use this in argo workflows.
                            // fromPairsParam.toArgumentParameter({
                            //     valueFromExpressionTag: expressionTag(
                            //         fromPairs({ string: toPairs(fromJson(hyphenateExpressionArgs(workflowJsonParam))).toString()}),
                            //     ),
                            // }),
                        ],
                    }),
                    template: castTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways cast expressions can be used.\n`,
            },
            generateName: 'cast-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [workflowIntParam, workflowFloatParam, workflowJsonParam, workflowBase64Param],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
