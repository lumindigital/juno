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
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import {
    hasPrefix,
    hasSuffix,
    indexOf,
    lastIndexOf,
    lower,
    repeat,
    replace,
    split,
    splitAfter,
    trim,
    trimPrefix,
    trimSuffix,
    upper,
} from '../../../src/api/expressions/string-function';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const trimParamWhiteSpace = new InputParameter('trim-param');
    const trimParamChars = new InputParameter('trim-param-chars');
    const trimParamCharsExpr = new InputParameter('trim-param-chars-expr');
    const trimPrefixParam = new InputParameter('trim-prefix-param');
    const trimPrefixExprParam = new InputParameter('trim-prefix-expr-param');
    const trimSuffixParam = new InputParameter('trim-suffix-param');
    const trimSuffixExprParam = new InputParameter('trim-suffix-expr-param');
    const upperParam = new InputParameter('upper-param');
    const lowerParam = new InputParameter('lower-param');
    const splitParam = new InputParameter('split-param');
    const splitExprParam = new InputParameter('split-expr-param');
    const splitNoIndexParam = new InputParameter('split-no-index-param');
    const splitAfterParam = new InputParameter('split-after-param');
    const splitAfterExprParam = new InputParameter('split-after-expr-param');
    const splitAfterNoIndexParam = new InputParameter('split-after-no-index-param');
    const replaceParam = new InputParameter('replace-param');
    const replaceExprParam = new InputParameter('replace-expr-param');
    const repeatParam = new InputParameter('repeat-param');
    const indexOfParam = new InputParameter('index-of-param');
    const indexOfExprParam = new InputParameter('index-of-expr-param');
    const lastIndexOfParam = new InputParameter('last-index-of-param');
    const lastIndexOfExprParam = new InputParameter('last-index-of-expr-param');
    const hasPrefixParam = new InputParameter('has-prefix-param');
    const hasPrefixExprParam = new InputParameter('has-prefix-expr-param');
    const hasSuffixParam = new InputParameter('has-suffix-param');
    const hasSuffixExprParam = new InputParameter('has-suffix-expr-param');

    const stringParam = new WorkflowParameter('workflow-string-param', { value: 'Hello World' });
    const firstWordParam = new WorkflowParameter('first-word-param', { value: 'Hello' });
    const secondWordParam = new WorkflowParameter('second-word-param', { value: 'World' });
    const delimiterParam = new WorkflowParameter('delimiter-param', { value: ' ' });
    const replacementParam = new WorkflowParameter('replacement-param', { value: 'Universe' });

    const stringfunctionTemplate = new Template('string-function', {
        inputs: new Inputs({
            parameters: [
                trimParamWhiteSpace,
                trimParamChars,
                trimParamCharsExpr,
                trimPrefixParam,
                trimPrefixExprParam,
                trimSuffixParam,
                trimSuffixExprParam,
                upperParam,
                lowerParam,
                splitParam,
                splitExprParam,
                splitNoIndexParam,
                splitAfterParam,
                splitAfterExprParam,
                splitAfterNoIndexParam,
                replaceParam,
                replaceExprParam,
                repeatParam,
                indexOfParam,
                indexOfExprParam,
                lastIndexOfParam,
                lastIndexOfExprParam,
                hasPrefixParam,
                hasPrefixExprParam,
                hasSuffixParam,
                hasSuffixExprParam,
            ],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(trimParamWhiteSpace)}" != "Hello World" ]; then echo "trim failed: got '${simpleTag(trimParamWhiteSpace)}'"; exit 11; fi
if [ "${simpleTag(trimParamChars)}" != " World" ]; then echo "trim with chars failed: got '${simpleTag(trimParamChars)}'"; exit 12; fi
if [ "${simpleTag(trimParamCharsExpr)}" != " World" ]; then echo "trim with chars expr failed: got '${simpleTag(trimParamCharsExpr)}'"; exit 13; fi
if [ "${simpleTag(trimPrefixParam)}" != " World" ]; then echo "trimPrefix failed: got '${simpleTag(trimPrefixParam)}'"; exit 14; fi
if [ "${simpleTag(trimPrefixExprParam)}" != " World" ]; then echo "trimPrefix expr failed: got '${simpleTag(trimPrefixExprParam)}'"; exit 15; fi
if [ "${simpleTag(trimSuffixParam)}" != "Hello " ]; then echo "trimSuffix failed: got '${simpleTag(trimSuffixParam)}'"; exit 16; fi
if [ "${simpleTag(trimSuffixExprParam)}" != "Hello " ]; then echo "trimSuffix expr failed: got '${simpleTag(trimSuffixExprParam)}'"; exit 17; fi
if [ "${simpleTag(upperParam)}" != "HELLO WORLD" ]; then echo "upper failed: got '${simpleTag(upperParam)}'"; exit 18; fi
if [ "${simpleTag(lowerParam)}" != "hello world" ]; then echo "lower failed: got '${simpleTag(lowerParam)}'"; exit 19; fi
if [ "${simpleTag(splitParam)}" != "Hello" ]; then echo "split failed: got '${simpleTag(splitParam)}'"; exit 20; fi
if [ "${simpleTag(splitExprParam)}" != "Hello" ]; then echo "split expr failed: got '${simpleTag(splitExprParam)}'"; exit 21; fi
if [ "${simpleTag(splitNoIndexParam)}" != '[Hello,World]' ]; then echo "split no index failed: got '${simpleTag(splitNoIndexParam)}'"; exit 35; fi
if [ "${simpleTag(splitAfterParam)}" != "Hello" ]; then echo "splitAfter failed: got '${simpleTag(splitAfterParam)}'"; exit 22; fi
if [ "${simpleTag(splitAfterExprParam)}" != "Hello" ]; then echo "splitAfter expr failed: got '${simpleTag(splitAfterExprParam)}'"; exit 23; fi
if [ "${simpleTag(splitAfterNoIndexParam)}" != '["Hello ","World"]' ]; then echo "splitAfter no index failed: got '${simpleTag(splitAfterNoIndexParam)}'"; exit 36; fi
if [ "${simpleTag(replaceParam)}" != "Hello Universe" ]; then echo "replace failed: got '${simpleTag(replaceParam)}'"; exit 24; fi
if [ "${simpleTag(replaceExprParam)}" != "Hello Universe" ]; then echo "replace expr failed: got '${simpleTag(replaceExprParam)}'"; exit 25; fi
if [ "${simpleTag(repeatParam)}" != "Hello WorldHello WorldHello World" ]; then echo "repeat failed: got '${simpleTag(repeatParam)}'"; exit 26; fi
if [ "${simpleTag(indexOfParam)}" != "6" ]; then echo "indexOf failed: got '${simpleTag(indexOfParam)}'"; exit 27; fi
if [ "${simpleTag(indexOfExprParam)}" != "6" ]; then echo "indexOf expr failed: got '${simpleTag(indexOfExprParam)}'"; exit 28; fi
if [ "${simpleTag(lastIndexOfParam)}" != "6" ]; then echo "lastIndexOf failed: got '${simpleTag(lastIndexOfParam)}'"; exit 29; fi
if [ "${simpleTag(lastIndexOfExprParam)}" != "6" ]; then echo "lastIndexOf expr failed: got '${simpleTag(lastIndexOfExprParam)}'"; exit 30; fi
if [ "${simpleTag(hasPrefixParam)}" != "true" ]; then echo "hasPrefix failed: got '${simpleTag(hasPrefixParam)}'"; exit 31; fi
if [ "${simpleTag(hasPrefixExprParam)}" != "true" ]; then echo "hasPrefix expr failed: got '${simpleTag(hasPrefixExprParam)}'"; exit 32; fi
if [ "${simpleTag(hasSuffixParam)}" != "true" ]; then echo "hasSuffix failed: got '${simpleTag(hasSuffixParam)}'"; exit 33; fi
if [ "${simpleTag(hasSuffixExprParam)}" != "true" ]; then echo "hasSuffix expr failed: got '${simpleTag(hasSuffixExprParam)}'"; exit 34; fi
echo "All string function tests passed"
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('string-function-task', {
                    arguments: new Arguments({
                        parameters: [
                            trimParamWhiteSpace.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(trim(hyphenateExpressionArgs(stringParam))),
                            }),
                            trimParamChars.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    trim(hyphenateExpressionArgs(stringParam), 'Hello'),
                                ),
                            }),
                            trimParamCharsExpr.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    trim(hyphenateExpressionArgs(stringParam), hyphenateExpressionArgs(firstWordParam)),
                                ),
                            }),
                            // The single space left after Hello will not be visible in argo workflows UI
                            trimPrefixParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    trimPrefix(hyphenateExpressionArgs(stringParam), 'Hello'),
                                ),
                            }),
                            trimPrefixExprParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    trimPrefix(
                                        hyphenateExpressionArgs(stringParam),
                                        hyphenateExpressionArgs(firstWordParam),
                                    ),
                                ),
                            }),
                            // The single space left before World will not be visible in argo workflows UI
                            trimSuffixParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    trimSuffix(hyphenateExpressionArgs(stringParam), 'World'),
                                ),
                            }),
                            trimSuffixExprParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    trimSuffix(
                                        hyphenateExpressionArgs(stringParam),
                                        hyphenateExpressionArgs(secondWordParam),
                                    ),
                                ),
                            }),
                            upperParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(upper(hyphenateExpressionArgs(stringParam))),
                            }),
                            lowerParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(lower(hyphenateExpressionArgs(stringParam))),
                            }),
                            splitParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    split(trim(hyphenateExpressionArgs(stringParam)), ' ', 1),
                                ),
                            }),
                            splitExprParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    split(
                                        trim(hyphenateExpressionArgs(stringParam)),
                                        hyphenateExpressionArgs(delimiterParam),
                                        1,
                                    ),
                                ),
                            }),
                            splitNoIndexParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    split(trim(hyphenateExpressionArgs(stringParam)), ' '),
                                ),
                            }),
                            splitAfterParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    splitAfter(trim(hyphenateExpressionArgs(stringParam)), 'Hello', 1),
                                ),
                            }),
                            splitAfterExprParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    splitAfter(
                                        trim(hyphenateExpressionArgs(stringParam)),
                                        hyphenateExpressionArgs(firstWordParam),
                                        1,
                                    ),
                                ),
                            }),
                            splitAfterNoIndexParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    splitAfter(trim(hyphenateExpressionArgs(stringParam)), ' '),
                                ),
                            }),
                            replaceParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    replace(hyphenateExpressionArgs(stringParam), 'World', 'Universe'),
                                ),
                            }),
                            replaceExprParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    replace(
                                        hyphenateExpressionArgs(stringParam),
                                        hyphenateExpressionArgs(secondWordParam),
                                        hyphenateExpressionArgs(replacementParam),
                                    ),
                                ),
                            }),
                            repeatParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(repeat(hyphenateExpressionArgs(stringParam), 3)),
                            }),
                            indexOfParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    indexOf(hyphenateExpressionArgs(stringParam), 'World'),
                                ),
                            }),
                            indexOfExprParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    indexOf(
                                        hyphenateExpressionArgs(stringParam),
                                        hyphenateExpressionArgs(secondWordParam),
                                    ),
                                ),
                            }),
                            lastIndexOfParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    lastIndexOf(hyphenateExpressionArgs(stringParam), 'World'),
                                ),
                            }),
                            lastIndexOfExprParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    lastIndexOf(
                                        hyphenateExpressionArgs(stringParam),
                                        hyphenateExpressionArgs(secondWordParam),
                                    ),
                                ),
                            }),
                            hasPrefixParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    hasPrefix(hyphenateExpressionArgs(stringParam), 'Hello'),
                                ),
                            }),
                            hasPrefixExprParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    hasPrefix(
                                        hyphenateExpressionArgs(stringParam),
                                        hyphenateExpressionArgs(firstWordParam),
                                    ),
                                ),
                            }),
                            hasSuffixParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    hasSuffix(hyphenateExpressionArgs(stringParam), 'World'),
                                ),
                            }),
                            hasSuffixExprParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    hasSuffix(
                                        hyphenateExpressionArgs(stringParam),
                                        hyphenateExpressionArgs(secondWordParam),
                                    ),
                                ),
                            }),
                        ],
                    }),
                    template: stringfunctionTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways string function expressions can be used.\n`,
            },
            generateName: 'string-function-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [stringParam, firstWordParam, secondWordParam, delimiterParam, replacementParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
