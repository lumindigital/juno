import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { expressionTag, hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { add, divide, exponent, modulus, multiply, subtract } from '../../../src/api/expressions/arithmetic';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';
import { equals } from '../../../src/api/expressions/comparison';
import { EnvironmentVariable } from '../../../src/api/environment-variable';
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
            env: [
                // numbers are passed as strings so we are comparing to string values not numbers here
                new EnvironmentVariable('ADD_EQUALS', {
                    valueFromExpressionTag: expressionTag(equals(hyphenateExpressionArgs(addParam), '3')),
                }),
                new EnvironmentVariable('SUBTRACT_EQUALS', {
                    valueFromExpressionTag: expressionTag(equals(hyphenateExpressionArgs(subtractParam), '-1')),
                }),
                new EnvironmentVariable('DIVIDE_EQUALS', {
                    valueFromExpressionTag: expressionTag(equals(hyphenateExpressionArgs(divideParam), '1')),
                }),
                new EnvironmentVariable('MULTIPLY_EQUALS', {
                    valueFromExpressionTag: expressionTag(equals(hyphenateExpressionArgs(multiplyParam), '4')),
                }),
                new EnvironmentVariable('MODULUS_EQUALS', {
                    valueFromExpressionTag: expressionTag(equals(hyphenateExpressionArgs(modulusParam), '0')),
                }),
                new EnvironmentVariable('EXPONENT_EQUALS', {
                    valueFromExpressionTag: expressionTag(equals(hyphenateExpressionArgs(exponentParam), '8')),
                }),
            ],
            command: ['/bin/sh', '-e'],
            source: `if [ "$ADD_EQUALS" != true ]; then exit 12; fi
                     if [ "$SUBTRACT_EQUALS" != true ]; then exit 13; fi
                     if [ "$DIVIDE_EQUALS" != true ]; then exit 14; fi
                     if [ "$MULTIPLY_EQUALS" != true ]; then exit 15; fi
                     if [ "$MODULUS_EQUALS" != true ]; then exit 16; fi
                     if [ "$EXPONENT_EQUALS" != true ]; then exit 17; fi
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
