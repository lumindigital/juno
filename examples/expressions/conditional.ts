import { Arguments, WorkflowArguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { equals } from '../../src/api/expressions/comparison';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../src/api/expressions/tag';

import { Inputs } from '../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { ternary } from '../../src/api/expressions/conditional';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const ternaryStringOutputParameter = new InputParameter('ternary-string-output-param');
    const ternaryExpressionArgsOutputParameter = new InputParameter('ternary-expression-args-output-param');
    const nestedTernaryParameter = new InputParameter('nested-ternary-param');

    const trueParam = new WorkflowParameter('true-param', { value: 'true' });
    const falseParam = new WorkflowParameter('false-param', { value: 'false' });

    const conditionalTemplate = new Template('conditional', {
        inputs: new Inputs({
            parameters: [ternaryStringOutputParameter, ternaryExpressionArgsOutputParameter, nestedTernaryParameter],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(ternaryStringOutputParameter).output}" != true ]; then exit 12; fi
                     if [ "${simpleTag(ternaryExpressionArgsOutputParameter).output}" != true ]; then exit 13; fi
                     if [ "${simpleTag(nestedTernaryParameter).output}" != true ]; then exit 14; fi
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
