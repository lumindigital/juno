import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import { add, divide, exponent, modulus, multiply, subtract } from '../../../src/api/expressions/arithmetic';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';
import { asInt } from '../../../src/api/expressions/cast';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const addParam = new InputParameter('add-param');
    const subtractParam = new InputParameter('subtract-param');
    const divideParam = new InputParameter('divide-param');
    const multiplyParam = new InputParameter('multiply-param');
    const modulusParam = new InputParameter('modulus-param');
    const exponentParam = new InputParameter('exponent-param');

    const workflowIntParam = new WorkflowParameter('workflow-int-param', { value: '2' });

    const arithmeticTemplate = new Template('arithmetic', {
        inputs: new Inputs({
            parameters: [addParam, subtractParam, divideParam, multiplyParam, modulusParam, exponentParam],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(addParam)}" != "3" ]; then echo "add failed: got '${simpleTag(addParam)}'"; exit 12; fi
if [ "${simpleTag(subtractParam)}" != "-1" ]; then echo "subtract failed: got '${simpleTag(subtractParam)}'"; exit 13; fi
if [ "${simpleTag(divideParam)}" != "1" ]; then echo "divide failed: got '${simpleTag(divideParam)}'"; exit 14; fi
if [ "${simpleTag(multiplyParam)}" != "4" ]; then echo "multiply failed: got '${simpleTag(multiplyParam)}'"; exit 15; fi
if [ "${simpleTag(modulusParam)}" != "0" ]; then echo "modulus failed: got '${simpleTag(modulusParam)}'"; exit 16; fi
if [ "${simpleTag(exponentParam)}" != "8" ]; then echo "exponent failed: got '${simpleTag(exponentParam)}'"; exit 17; fi
echo "All arithmetic tests passed"
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('arithmetic-task', {
                    arguments: new Arguments({
                        parameters: [
                            addParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    add(asInt(hyphenateExpressionArgs(workflowIntParam)), 1),
                                ),
                            }),
                            subtractParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    subtract(asInt(hyphenateExpressionArgs(workflowIntParam)), 3),
                                ),
                            }),
                            divideParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    divide(asInt(hyphenateExpressionArgs(workflowIntParam)), 2),
                                ),
                            }),
                            multiplyParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    multiply(asInt(hyphenateExpressionArgs(workflowIntParam)), 2),
                                ),
                            }),
                            modulusParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    modulus(asInt(hyphenateExpressionArgs(workflowIntParam)), 2),
                                ),
                            }),
                            exponentParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    exponent(asInt(hyphenateExpressionArgs(workflowIntParam)), 3),
                                ),
                            }),
                        ],
                    }),
                    template: arithmeticTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways arithmetic expressions can be used.\n`,
            },
            generateName: 'arithmetic-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [workflowIntParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
