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
import { hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const concatenationParam = new InputParameter('concatenation-param');
    const containsParam = new InputParameter('contains-param');
    const startsWithParam = new InputParameter('starts-with-param');
    const endsWithParam = new InputParameter('ends-with-param');

    const stringParam = new WorkflowParameter('workflow-string-param', { value: 'Hello World' });

    const stringoperatorTemplate = new Template('string-operator', {
        inputs: new Inputs({
            parameters: [concatenationParam, containsParam, startsWithParam, endsWithParam],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(concatenationParam)}" != "Hello World!" ]; then echo "concatenation failed: got '${simpleTag(concatenationParam)}'"; exit 11; fi
if [ "${simpleTag(containsParam)}" != "true" ]; then echo "contains failed: got '${simpleTag(containsParam)}'"; exit 12; fi
if [ "${simpleTag(startsWithParam)}" != "true" ]; then echo "startsWith failed: got '${simpleTag(startsWithParam)}'"; exit 13; fi
if [ "${simpleTag(endsWithParam)}" != "true" ]; then echo "endsWith failed: got '${simpleTag(endsWithParam)}'"; exit 14; fi
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
                                value: `{{=${hyphenateExpressionArgs(stringParam)} + "!"}}`,
                            }),
                            containsParam.toArgumentParameter({
                                value: `{{=${hyphenateExpressionArgs(stringParam)} contains "World"}}`,
                            }),
                            startsWithParam.toArgumentParameter({
                                value: `{{=${hyphenateExpressionArgs(stringParam)} startsWith "Hello"}}`,
                            }),
                            endsWithParam.toArgumentParameter({
                                value: `{{=${hyphenateExpressionArgs(stringParam)} endsWith "World"}}`,
                            }),
                        ],
                    }),
                    template: stringoperatorTemplate,
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
                parameters: [stringParam],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
