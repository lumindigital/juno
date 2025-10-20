import { Arguments } from '../src/api/arguments';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const safeToRetryTemplate = new Template('safe-to-retry', {
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `print("true")
`,
        }),
    });

    const safeToRetryInputParameter = new InputParameter('safe-to-retry');

    const retryScriptTemplate = new Template('retry-script', {
        inputs: new Inputs({
            parameters: [safeToRetryInputParameter],
        }),
        retryStrategy: {
            expression: 'asInt(lastRetry.exitCode) > 1 && {{inputs.parameters.safe-to-retry}} == true',
            limit: '10',
        },
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import random;
import sys;
exit_code = random.choice([1, 2]);
sys.exit(exit_code)
`,
        }),
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('safe-to-retry', {
                    template: safeToRetryTemplate,
                }),
            ],
            [
                new WorkflowStep('retry', {
                    arguments: new Arguments({
                        parameters: [
                            safeToRetryInputParameter.toArgumentParameter({
                                value: '{{steps.safe-to-retry.outputs.result}}',
                            }),
                        ],
                    }),
                    template: retryScriptTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'retry-script-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
