import { Arguments, WorkflowArguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { and, equals, not, or, paren } from '../../src/api/expr-api';
import { expressionTag, hyphenParameter, simpleTag } from '../../src/api/expression';
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

    const logicalOperatorsTemplate = new Template('logical-operators', {
        inputs: new Inputs({
            parameters: [andParameter, orParameter, parenParameter, notParameter, combinedParameter],
        }),
        script: new Script({
            command: ['/bin/sh'],
            source: `if [ "${simpleTag(andParameter)}" !== true ]; then exit 12; fi
                    if [ "${simpleTag(orParameter)}" !== true ]; then exit 13; fi
                    if [ "${simpleTag(parenParameter)}" !== true ]; then exit 14; fi
                    if [ "${simpleTag(notParameter)}" !== true ]; then exit 15; fi
                    if [ "${simpleTag(combinedParameter)}" !== true ]; then exit 16; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('logical-operators-task', {
                    arguments: new Arguments({
                        parameters: [
                            andParameter.toArgumentParameter({
                                value: `${expressionTag(and([equals(hyphenParameter(trueParam), true), equals(hyphenParameter(falseParam), false)]))}`,
                            }),
                            orParameter.toArgumentParameter({
                                value: `${expressionTag(or([equals(hyphenParameter(trueParam), true), equals(hyphenParameter(falseParam), true)]))}`,
                            }),
                            parenParameter.toArgumentParameter({
                                value: `${expressionTag(paren(or([equals(hyphenParameter(trueParam), true), equals(hyphenParameter(falseParam), false)])))}`,
                            }),
                            notParameter.toArgumentParameter({
                                value: `${expressionTag(not(paren(equals(hyphenParameter(falseParam), true))))}`,
                            }),
                            combinedParameter.toArgumentParameter({
                                value: `${expressionTag(and([paren(or([equals(hyphenParameter(trueParam), true), equals(hyphenParameter(falseParam), false)])), not(paren(equals(hyphenParameter(falseParam), true)))]))}`,
                            }),
                        ],
                    }),
                    template: logicalOperatorsTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is a simple hello world example.\n`,
            },
            generateName: 'logical-operators-',
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
