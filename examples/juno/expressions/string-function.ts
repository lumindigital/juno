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
import { hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const trimParam = new InputParameter('trim-param');
    const trimPrefixParam = new InputParameter('trim-prefix-param');
    const trimSuffixParam = new InputParameter('trim-suffix-param');
    const upperParam = new InputParameter('upper-param');
    const lowerParam = new InputParameter('lower-param');
    const splitParam = new InputParameter('split-param');
    const splitAfterParam = new InputParameter('split-after-param');
    const replaceParam = new InputParameter('replace-param');
    const repeatParam = new InputParameter('repeat-param');
    const indexOfParam = new InputParameter('index-of-param');
    const lastIndexOfParam = new InputParameter('last-index-of-param');
    const hasPrefixParam = new InputParameter('has-prefix-param');
    const hasSuffixParam = new InputParameter('has-suffix-param');

    const stringParam = new WorkflowParameter('workflow-string-param', { value: 'Hello World' });

    const stringfunctionTemplate = new Template('string-function', {
        inputs: new Inputs({
            parameters: [
                trimParam,
                trimPrefixParam,
                trimSuffixParam,
                upperParam,
                lowerParam,
                splitParam,
                splitAfterParam,
                replaceParam,
                repeatParam,
                indexOfParam,
                lastIndexOfParam,
                hasPrefixParam,
                hasSuffixParam,
            ],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(trimParam)}" != "Hello World" ]; then echo "trim failed: got '${simpleTag(trimParam)}'"; exit 11; fi
if [ "${simpleTag(trimPrefixParam)}" != " World" ]; then echo "trimPrefix failed: got '${simpleTag(trimPrefixParam)}'"; exit 12; fi
if [ "${simpleTag(trimSuffixParam)}" != "Hello " ]; then echo "trimSuffix failed: got '${simpleTag(trimSuffixParam)}'"; exit 13; fi
if [ "${simpleTag(upperParam)}" != "HELLO WORLD" ]; then echo "upper failed: got '${simpleTag(upperParam)}'"; exit 14; fi
if [ "${simpleTag(lowerParam)}" != "hello world" ]; then echo "lower failed: got '${simpleTag(lowerParam)}'"; exit 15; fi
if [ "${simpleTag(splitParam)}" != "Hello" ]; then echo "split failed: got '${simpleTag(splitParam)}'"; exit 16; fi
if [ "${simpleTag(splitAfterParam)}" != "Hello" ]; then echo "splitAfter failed: got '${simpleTag(splitAfterParam)}'"; exit 17; fi
if [ "${simpleTag(replaceParam)}" != "Hello Universe" ]; then echo "replace failed: got '${simpleTag(replaceParam)}'"; exit 18; fi
if [ "${simpleTag(repeatParam)}" != "Hello WorldHello WorldHello World" ]; then echo "repeat failed: got '${simpleTag(repeatParam)}'"; exit 19; fi
if [ "${simpleTag(indexOfParam)}" != "6" ]; then echo "indexOf failed: got '${simpleTag(indexOfParam)}'"; exit 20; fi
if [ "${simpleTag(lastIndexOfParam)}" != "6" ]; then echo "lastIndexOf failed: got '${simpleTag(lastIndexOfParam)}'"; exit 21; fi
if [ "${simpleTag(hasPrefixParam)}" != "true" ]; then echo "hasPrefix failed: got '${simpleTag(hasPrefixParam)}'"; exit 22; fi
if [ "${simpleTag(hasSuffixParam)}" != "true" ]; then echo "hasSuffix failed: got '${simpleTag(hasSuffixParam)}'"; exit 23; fi
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
                            trimParam.toArgumentParameter({
                                value: `{{=" " + ${hyphenateExpressionArgs(stringParam)} + " " | trim()}}`,
                            }),
                            // The single space left after Hello will not be visible in argo workflows UI
                            trimPrefixParam.toArgumentParameter({
                                value: `{{=trimPrefix(${hyphenateExpressionArgs(stringParam)}, "Hello")}}`,
                            }),
                            // The single space left before World will not be visible in argo workflows UI
                            trimSuffixParam.toArgumentParameter({
                                value: `{{=trimSuffix(${hyphenateExpressionArgs(stringParam)}, "World")}}`,
                            }),
                            upperParam.toArgumentParameter({
                                value: `{{=upper(${hyphenateExpressionArgs(stringParam)})}}`,
                            }),
                            lowerParam.toArgumentParameter({
                                value: `{{=lower(${hyphenateExpressionArgs(stringParam)})}}`,
                            }),
                            splitParam.toArgumentParameter({
                                value: `{{=split(trim(${hyphenateExpressionArgs(stringParam)}), " ")[0]}}`,
                            }),
                            splitAfterParam.toArgumentParameter({
                                value: `{{=splitAfter(trim(${hyphenateExpressionArgs(stringParam)}), "Hello")[0]}}`,
                            }),
                            replaceParam.toArgumentParameter({
                                value: `{{=replace(${hyphenateExpressionArgs(stringParam)}, "World", "Universe")}}`,
                            }),
                            repeatParam.toArgumentParameter({
                                value: `{{=repeat(${hyphenateExpressionArgs(stringParam)}, 3)}}`,
                            }),
                            indexOfParam.toArgumentParameter({
                                value: `{{=indexOf(${hyphenateExpressionArgs(stringParam)}, "World")}}`,
                            }),
                            lastIndexOfParam.toArgumentParameter({
                                value: `{{=lastIndexOf(${hyphenateExpressionArgs(stringParam)}, "World")}}`,
                            }),
                            hasPrefixParam.toArgumentParameter({
                                value: `{{=hasPrefix(${hyphenateExpressionArgs(stringParam)}, "Hello")}}`,
                            }),
                            hasSuffixParam.toArgumentParameter({
                                value: `{{=hasSuffix(${hyphenateExpressionArgs(stringParam)}, "World")}}`,
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
                parameters: [stringParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
