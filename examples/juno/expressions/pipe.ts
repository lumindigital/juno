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
    const pipeParameter = new InputParameter('pipe-param');

    const stringParam = new WorkflowParameter('workflow-string-param', { value: 'THIS IS A STRING' });

    const pipeTemplate = new Template('pipe', {
        inputs: new Inputs({
            parameters: [pipeParameter],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(pipeParameter)}" != "this is a string" ]; then exit 12; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('pipe-task', {
                    arguments: new Arguments({
                        parameters: [
                            // juno doesn't support pipes natively, so we use string interpolation instead
                            pipeParameter.toArgumentParameter({
                                value: `{{=${hyphenateExpressionArgs(stringParam)} | lower()}}`,
                            }),
                        ],
                    }),
                    template: pipeTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways pipe expressions can be used.\n`,
            },
            generateName: 'pipe-',
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
