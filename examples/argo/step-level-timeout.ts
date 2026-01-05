import { Arguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expression';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const timeoutInputParameter = new InputParameter('timeout');

    const sleepTemplate = new Template('sleep', {
        container: new Container({
            args: ['sleep 30s'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [timeoutInputParameter],
        }),
        timeout: simpleTag(timeoutInputParameter),
    });

    const sleepSleepTemplate = new Template('sleep-sleep', {
        steps: [
            [
                new WorkflowStep('sleep1', {
                    arguments: new Arguments({
                        parameters: [timeoutInputParameter.toArgumentParameter({ value: '10s' })],
                    }),
                    continueOn: {
                        error: true,
                    },
                    template: sleepTemplate,
                }),
                new WorkflowStep('sleep2', {
                    arguments: new Arguments({
                        parameters: [timeoutInputParameter.toArgumentParameter({ value: '10s' })],
                    }),
                    continueOn: {
                        failed: true,
                    },
                    template: sleepTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'steps-tmpl-timeout-',
        },
        spec: new WorkflowSpec({
            entrypoint: sleepSleepTemplate,
        }),
    }).toWorkflow();
}
