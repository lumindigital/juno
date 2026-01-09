import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { equals } from '../../../src/api/expressions/comparison';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';

import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';
import { nilCoalescing, ternary } from '../../../src/api/expressions/conditional';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const ternaryStringOutputParameter = new InputParameter('ternary-string-output-param');
    const ternaryExpressionArgsOutputParameter = new InputParameter('ternary-expression-args-output-param');
    const nestedTernaryParameter = new InputParameter('nested-ternary-param');
    const nilCoalescingStringParameter = new InputParameter('nil-coalescing-string-param');
    const nilCoalescingHyphenatedParameter = new InputParameter('nil-coalescing-hyphenated-param');

    const trueParam = new WorkflowParameter('true-param', { value: 'true' });
    const falseParam = new WorkflowParameter('false-param', { value: 'false' });
    // technically this shouldn't work as we should validate that emptyParam is missing. However we cannot do that so its a good way to test nil
    const emptyParam = new WorkflowParameter('missing-param', { value: 'true' });

    const conditionalTemplate = new Template('conditional', {
        inputs: new Inputs({
            parameters: [
                ternaryStringOutputParameter,
                ternaryExpressionArgsOutputParameter,
                nestedTernaryParameter,
                nilCoalescingStringParameter,
                nilCoalescingHyphenatedParameter,
            ],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(ternaryStringOutputParameter)}" != true ]; then exit 12; fi
                     if [ "${simpleTag(ternaryExpressionArgsOutputParameter)}" != true ]; then exit 13; fi
                     if [ "${simpleTag(nestedTernaryParameter)}" != true ]; then exit 14; fi
                     if [ "${simpleTag(nilCoalescingStringParameter)}" != "defaultValue" ]; then exit 15; fi
                     if [ "${simpleTag(nilCoalescingHyphenatedParameter)}" != "true" ]; then exit 16; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('conditional-task', {
                    arguments: new Arguments({
                        parameters: [
                            ternaryStringOutputParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ternary(
                                        equals(hyphenateExpressionArgs(trueParam), hyphenateExpressionArgs(trueParam)),
                                        'true',
                                        'false',
                                    ),
                                ),
                            }),
                            ternaryExpressionArgsOutputParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ternary(
                                        equals(hyphenateExpressionArgs(trueParam), hyphenateExpressionArgs(trueParam)),
                                        hyphenateExpressionArgs(trueParam),
                                        hyphenateExpressionArgs(falseParam),
                                    ),
                                ),
                            }),
                            nestedTernaryParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ternary(
                                        equals(hyphenateExpressionArgs(trueParam), hyphenateExpressionArgs(trueParam)),
                                        ternary(
                                            equals(
                                                hyphenateExpressionArgs(trueParam),
                                                hyphenateExpressionArgs(trueParam),
                                            ),
                                            hyphenateExpressionArgs(trueParam),
                                            hyphenateExpressionArgs(falseParam),
                                        ),
                                        ternary(
                                            equals(
                                                hyphenateExpressionArgs(trueParam),
                                                hyphenateExpressionArgs(trueParam),
                                            ),
                                            hyphenateExpressionArgs(trueParam),
                                            hyphenateExpressionArgs(falseParam),
                                        ),
                                    ),
                                ),
                            }),
                            nilCoalescingStringParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    nilCoalescing(hyphenateExpressionArgs(emptyParam), 'defaultValue'),
                                ),
                            }),
                            nilCoalescingHyphenatedParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    nilCoalescing(
                                        hyphenateExpressionArgs(emptyParam),
                                        hyphenateExpressionArgs(trueParam),
                                    ),
                                ),
                            }),
                        ],
                    }),
                    template: conditionalTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways conditional expressions can be used.\n`,
            },
            generateName: 'conditional-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [trueParam, falseParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
