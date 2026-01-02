import { Arguments, WorkflowArguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { or, and, paren, not } from '../../src/api/expressions/logical';
import { equals } from '../../src/api/expressions/comparison';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../src/api/expressions/tag';

import { Inputs } from '../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const andParameter = new InputParameter('and-param');
    const orParameter = new InputParameter('or-param');
    const parenParameter = new InputParameter('paren-param');
    const notParameter = new InputParameter('not-param');
    const combinedParameter = new InputParameter('combined-param');

    const trueParam = new WorkflowParameter('true-param', { value: 'true' });
    const falseParam = new WorkflowParameter('false-param', { value: 'false' });

    const logicalTemplate = new Template('logical', {
        inputs: new Inputs({
            parameters: [andParameter, orParameter, parenParameter, notParameter, combinedParameter],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(andParameter).output}" != true ]; then exit 12; fi
                    if [ "${simpleTag(orParameter).output}" != true ]; then exit 13; fi
                    if [ "${simpleTag(parenParameter).output}" != true ]; then exit 14; fi
                    if [ "${simpleTag(notParameter).output}" != true ]; then exit 15; fi
                    if [ "${simpleTag(combinedParameter).output}" != true ]; then exit 16; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('logical-task', {
                    arguments: new Arguments({
                        parameters: [
                            andParameter.toArgumentParameter({
                                value: `${
                                    expressionTag(
                                        and([
                                            equals(hyphenateExpressionArgs(trueParam), true),
                                            equals(hyphenateExpressionArgs(falseParam), false),
                                        ]),
                                    ).output
                                }`,
                            }),
                            orParameter.toArgumentParameter({
                                value: `${expressionTag(or([equals(hyphenateExpressionArgs(trueParam), true), equals(hyphenateExpressionArgs(falseParam), true)])).output}`,
                            }),
                            parenParameter.toArgumentParameter({
                                value: `${expressionTag(paren(or([equals(hyphenateExpressionArgs(trueParam), true), equals(hyphenateExpressionArgs(falseParam), false)]))).output}`,
                            }),
                            notParameter.toArgumentParameter({
                                value: `${expressionTag(not(equals(hyphenateExpressionArgs(falseParam), true))).output}`,
                            }),
                            combinedParameter.toArgumentParameter({
                                value: `${expressionTag(and([paren(or([equals(hyphenateExpressionArgs(trueParam), true), equals(hyphenateExpressionArgs(falseParam), false)])), not(equals(hyphenateExpressionArgs(falseParam), true))])).output}`,
                            }),
                        ],
                    }),
                    template: logicalTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of some of the different ways logical expressions can be used.\n`,
            },
            generateName: 'logical-',
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
