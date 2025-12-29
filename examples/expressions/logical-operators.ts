import { Arguments, WorkflowArguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { and, equals, not, or, paren } from '../../src/api/expr-api';
import { expressionTag, simpleTag } from '../../src/api/expression';
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
            //args: ['hello world'],
            source: `echo "AND: ${simpleTag(andParameter)}"
                    echo "OR: ${simpleTag(orParameter)}"
                    echo "PAREN: ${simpleTag(parenParameter)}"
                    echo "NOT: ${simpleTag(notParameter)}"
                    echo "COMBINED: ${simpleTag(combinedParameter)}"
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
                                value: `${expressionTag(equals(and([trueParam, falseParam]), 'false'))}`,
                            }),
                            orParameter.toArgumentParameter({
                                value: `${expressionTag(equals(or([trueParam, falseParam]), 'true'))}`,
                            }),
                            parenParameter.toArgumentParameter({
                                value: `${expressionTag(equals(or([trueParam, falseParam]), 'true'))}`,
                            }),
                            notParameter.toArgumentParameter({
                                value: `${expressionTag(equals(not(falseParam), 'true'))}`,
                            }),
                            combinedParameter.toArgumentParameter({
                                value: `${expressionTag(equals(and([paren(or([trueParam, falseParam])), not(falseParam)]), 'true'))}`,
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
            generateName: 'hello-world-',
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
