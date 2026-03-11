import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import { asFloat } from '../../../src/api/expressions/cast';
import { abs, ceil, floor, max, min, round } from '../../../src/api/expressions/number';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const maxParam = new InputParameter('max-param');
    const minParam = new InputParameter('min-param');
    const absParam = new InputParameter('abs-param');
    const ceilParam = new InputParameter('ceil-param');
    const floorParam = new InputParameter('floor-param');
    const roundParam = new InputParameter('round-param');

    const workflowParamA = new WorkflowParameter('param-a', { value: '10.7' });
    const workflowParamB = new WorkflowParameter('param-b', { value: '3.2' });
    const workflowParamC = new WorkflowParameter('param-c', { value: '-5.5' });

    const numberTemplate = new Template('number', {
        inputs: new Inputs({
            parameters: [maxParam, minParam, absParam, ceilParam, floorParam, roundParam],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(maxParam)}" != "10.7" ]; then echo "max failed: got '${simpleTag(maxParam)}'"; exit 11; fi
if [ "${simpleTag(minParam)}" != "3.2" ]; then echo "min failed: got '${simpleTag(minParam)}'"; exit 12; fi
if [ "${simpleTag(absParam)}" != "5.5" ]; then echo "abs failed: got '${simpleTag(absParam)}'"; exit 13; fi
if [ "${simpleTag(ceilParam)}" != "11" ]; then echo "ceil failed: got '${simpleTag(ceilParam)}'"; exit 14; fi
if [ "${simpleTag(floorParam)}" != "10" ]; then echo "floor failed: got '${simpleTag(floorParam)}'"; exit 15; fi
if [ "${simpleTag(roundParam)}" != "11" ]; then echo "round failed: got '${simpleTag(roundParam)}'"; exit 16; fi
echo "All number function tests passed"
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('number-task', {
                    arguments: new Arguments({
                        parameters: [
                            maxParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    max(
                                        asFloat(hyphenateExpressionArgs(workflowParamA)),
                                        asFloat(hyphenateExpressionArgs(workflowParamB)),
                                    ),
                                ),
                            }),
                            minParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    min(
                                        asFloat(hyphenateExpressionArgs(workflowParamA)),
                                        asFloat(hyphenateExpressionArgs(workflowParamB)),
                                    ),
                                ),
                            }),
                            absParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    abs(asFloat(hyphenateExpressionArgs(workflowParamC))),
                                ),
                            }),
                            ceilParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    ceil(asFloat(hyphenateExpressionArgs(workflowParamA))),
                                ),
                            }),
                            floorParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    floor(asFloat(hyphenateExpressionArgs(workflowParamA))),
                                ),
                            }),
                            roundParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    round(asFloat(hyphenateExpressionArgs(workflowParamA))),
                                ),
                            }),
                        ],
                    }),
                    template: numberTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways number expressions can be used.\n`,
            },
            generateName: 'number-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [workflowParamA, workflowParamB, workflowParamC],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
