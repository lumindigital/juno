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
import { concatenate, contains, endsWith, startsWith } from '../../../src/api/expressions/string-operator';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const concatenationParam = new InputParameter('concatenation-param');
    const containsParam = new InputParameter('contains-param');
    const startsWithParam = new InputParameter('starts-with-param');
    const endsWithParam = new InputParameter('ends-with-param');
    const containsExpressionParam = new InputParameter('contains-expression-param');
    const startsWithExpressionParam = new InputParameter('starts-with-expression-param');
    const endsWithExpressionParam = new InputParameter('ends-with-expression-param');

    const fullStringParam = new WorkflowParameter('workflow-string-param', { value: 'Hello World' });
    const firstWordParam = new WorkflowParameter('first-word-param', { value: 'Hello' });
    const secondWordParam = new WorkflowParameter('second-word-param', { value: 'World' });

    const stringOperatorTemplate = new Template('string-operator', {
        inputs: new Inputs({
            parameters: [
                concatenationParam,
                containsParam,
                startsWithParam,
                endsWithParam,
                containsExpressionParam,
                startsWithExpressionParam,
                endsWithExpressionParam,
            ],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(concatenationParam)}" != "Hello World!" ]; then echo "concatenation failed: got '${simpleTag(concatenationParam)}'"; exit 11; fi
if [ "${simpleTag(containsParam)}" != "true" ]; then echo "contains failed: got '${simpleTag(containsParam)}'"; exit 12; fi
if [ "${simpleTag(startsWithParam)}" != "true" ]; then echo "startsWith failed: got '${simpleTag(startsWithParam)}'"; exit 13; fi
if [ "${simpleTag(endsWithParam)}" != "true" ]; then echo "endsWith failed: got '${simpleTag(endsWithParam)}'"; exit 14; fi
if [ "${simpleTag(containsExpressionParam)}" != "true" ]; then echo "containsExpression failed: got '${simpleTag(containsExpressionParam)}'"; exit 15; fi
if [ "${simpleTag(startsWithExpressionParam)}" != "true" ]; then echo "startsWithExpression failed: got '${simpleTag(startsWithExpressionParam)}'"; exit 16; fi
if [ "${simpleTag(endsWithExpressionParam)}" != "true" ]; then echo "endsWithExpression failed: got '${simpleTag(endsWithExpressionParam)}'"; exit 17; fi
echo "All string function tests passed"
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('string-operator-task', {
                    arguments: new Arguments({
                        parameters: [
                            concatenationParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    concatenate(hyphenateExpressionArgs(fullStringParam), '!'),
                                ),
                            }),
                            containsParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    contains(hyphenateExpressionArgs(fullStringParam), 'World'),
                                ),
                            }),
                            startsWithParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    startsWith(hyphenateExpressionArgs(fullStringParam), 'Hello'),
                                ),
                            }),
                            endsWithParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    endsWith(hyphenateExpressionArgs(fullStringParam), 'World'),
                                ),
                            }),
                            containsExpressionParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    contains(
                                        hyphenateExpressionArgs(fullStringParam),
                                        hyphenateExpressionArgs(secondWordParam),
                                    ),
                                ),
                            }),
                            startsWithExpressionParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    startsWith(
                                        hyphenateExpressionArgs(fullStringParam),
                                        hyphenateExpressionArgs(firstWordParam),
                                    ),
                                ),
                            }),
                            endsWithExpressionParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    endsWith(
                                        hyphenateExpressionArgs(fullStringParam),
                                        hyphenateExpressionArgs(secondWordParam),
                                    ),
                                ),
                            }),
                        ],
                    }),
                    template: stringOperatorTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways string operator expressions can be used.\n`,
            },
            generateName: 'string-operator-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [fullStringParam, firstWordParam, secondWordParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
