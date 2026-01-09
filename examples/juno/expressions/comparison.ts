import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import {
    equals,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    notEquals,
} from '../../../src/api/expressions/comparison';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import { asInt } from '../../../src/api/expressions/cast';

import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';
import { ternary } from '../../../src/api/expressions/conditional';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const equalsTernaryParameters = new InputParameter('equals-ternary-param');
    const notEqualsTernaryParameter = new InputParameter('not-equals-ternary-param');
    const greaterThanTernaryParameter = new InputParameter('greater-than-ternary-param');
    const lessThanTernaryParameter = new InputParameter('less-than-ternary-param');
    const greaterThanEqualTernaryParameter = new InputParameter('greater-than-equal-ternary-param');
    const lessThanEqualTernaryParameter = new InputParameter('less-than-equal-ternary-param');

    const trueParam = new WorkflowParameter('true-param', { value: 'true' });
    const falseParam = new WorkflowParameter('false-param', { value: 'false' });
    const oneParam = new WorkflowParameter('one-param', { value: '1' });
    const twoParam = new WorkflowParameter('two-param', { value: '2' });

    const comparisonTemplate = new Template('comparison', {
        inputs: new Inputs({
            parameters: [
                equalsTernaryParameters,
                notEqualsTernaryParameter,
                greaterThanTernaryParameter,
                lessThanTernaryParameter,
                greaterThanEqualTernaryParameter,
                lessThanEqualTernaryParameter,
            ],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(equalsTernaryParameters)}" != true ]; then exit 12; fi
                     if [ "${simpleTag(notEqualsTernaryParameter)}" != true ]; then exit 13; fi
                     if [ "${simpleTag(greaterThanTernaryParameter)}" != true ]; then exit 14; fi
                     if [ "${simpleTag(lessThanTernaryParameter)}" != true ]; then exit 15; fi
                     if [ "${simpleTag(greaterThanEqualTernaryParameter)}" != true ]; then exit 16; fi
                     if [ "${simpleTag(lessThanEqualTernaryParameter)}" != true ]; then exit 17; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('comparison-task', {
                    arguments: new Arguments({
                        parameters: [
                            equalsTernaryParameters.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ternary(
                                        equals(hyphenateExpressionArgs(trueParam), hyphenateExpressionArgs(trueParam)),
                                        'true',
                                        'false',
                                    ),
                                ),
                            }),
                            notEqualsTernaryParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ternary(
                                        notEquals(
                                            hyphenateExpressionArgs(trueParam),
                                            hyphenateExpressionArgs(falseParam),
                                        ),
                                        hyphenateExpressionArgs(trueParam),
                                        hyphenateExpressionArgs(falseParam),
                                    ),
                                ),
                            }),
                            greaterThanTernaryParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ternary(
                                        greaterThan(
                                            asInt(hyphenateExpressionArgs(twoParam)),
                                            asInt(hyphenateExpressionArgs(oneParam)),
                                        ),
                                        'true',
                                        'false',
                                    ),
                                ),
                            }),
                            lessThanTernaryParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ternary(
                                        lessThan(
                                            asInt(hyphenateExpressionArgs(oneParam)),
                                            asInt(hyphenateExpressionArgs(twoParam)),
                                        ),
                                        'true',
                                        'false',
                                    ),
                                ),
                            }),
                            greaterThanEqualTernaryParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ternary(
                                        greaterThanOrEqual(
                                            asInt(hyphenateExpressionArgs(oneParam)),
                                            asInt(hyphenateExpressionArgs(oneParam)),
                                        ),
                                        'true',
                                        'false',
                                    ),
                                ),
                            }),
                            lessThanEqualTernaryParameter.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ternary(
                                        lessThanOrEqual(
                                            asInt(hyphenateExpressionArgs(oneParam)),
                                            asInt(hyphenateExpressionArgs(twoParam)),
                                        ),
                                        'true',
                                        'false',
                                    ),
                                ),
                            }),
                        ],
                    }),
                    template: comparisonTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways comparison expressions can be used.\n`,
            },
            generateName: 'comparison-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [trueParam, falseParam, oneParam, twoParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
