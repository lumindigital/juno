import { Arguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../../../src/api/expressions/tag';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const rangeParamTest = new InputParameter('range-param');

    const rangeTemplate = new Template('range', {
        inputs: new Inputs({
            parameters: [rangeParamTest],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(rangeParamTest)}" != "[1,2,3]" ]; then exit 12; fi
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('range-task', {
                    arguments: new Arguments({
                        parameters: [
                            // juno doesn't support ranges natively, so we use string interpolation instead
                            rangeParamTest.toArgumentParameter({
                                value: `{{=1..3}}`,
                            }),
                        ],
                    }),
                    template: rangeTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways range expressions can be used.\n`,
            },
            generateName: 'range-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
