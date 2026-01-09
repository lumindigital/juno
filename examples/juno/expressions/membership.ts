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
import { jsonPath } from '../../../src/api/expressions/json-path';
import { isIn } from '../../../src/api/expressions/membership';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const inParamTest = new InputParameter('in-param');
    const dotParamTest = new InputParameter('dot-param');
    const bracketParamTest = new InputParameter('bracket-param');
    const arrayBracketParamTest = new InputParameter('array-bracket-param');

    const workflowJsonParam = new WorkflowParameter('workflow-json-param', { value: '{"isTrue":"true"}' });
    const arrayParam = new WorkflowParameter('workflow-array-param', { value: '{"count":["one", "two", "three"]}' });
    const badKeyParam = new WorkflowParameter('bad-key-param', { value: 'badKey' });

    const membershipTemplate = new Template('membership', {
        inputs: new Inputs({
            parameters: [inParamTest, dotParamTest, bracketParamTest, arrayBracketParamTest],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(inParamTest)}" != false ]; then exit 12; fi
                     if [ "${simpleTag(dotParamTest)}" != true ]; then exit 13; fi
                     if [ "${simpleTag(bracketParamTest)}" != true ]; then exit 14; fi
                     if [ "${simpleTag(arrayBracketParamTest)}" != "one" ]; then exit 15; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('membership-task', {
                    arguments: new Arguments({
                        parameters: [
                            inParamTest.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    isIn(hyphenateExpressionArgs(badKeyParam), jsonPath(workflowJsonParam, '$')),
                                ),
                            }),
                            // You have to convert the json string into a json object first before accessing properties
                            // Juno doesn't support accessing properties with dot notation, so we use string interpolation instead
                            dotParamTest.toArgumentParameter({
                                value: `{{=${jsonPath(workflowJsonParam, '$')}.isTrue}}`,
                            }),
                            // You have to convert the json string into a json object first before accessing properties
                            // Juno doesn't support accessing properties by brackets natively, so we use string interpolation instead
                            bracketParamTest.toArgumentParameter({
                                value: `{{=${jsonPath(workflowJsonParam, '$')}["isTrue"]}}`,
                            }),
                            // You have to convert the json string into a json object first before accessing properties
                            // Juno doesn't support membership by array index natively, so we use string interpolation instead
                            arrayBracketParamTest.toArgumentParameter({
                                value: `{{=${jsonPath(arrayParam, '$.count')}[0]}}`,
                            }),
                            // You cannot use ?. in argo workflows. if you do the parameter return the expression IE: {{=jsonpath(workflow.parameters['workflow-json-param'], '$')?.nonExistentKey}}
                            // optionalChaining.toArgumentParameter({
                            //     value: `{{=jsonpath(workflow.parameters['workflow-json-param'], '$')?.nonExistentKey}}`,
                            // }),
                        ],
                    }),
                    template: membershipTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways membership expressions can be used.\n`,
            },
            generateName: 'membership-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [workflowJsonParam, arrayParam, badKeyParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
