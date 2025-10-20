import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { simpleTag } from '../src/api/expression';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const failingContainerTemplate = new Template('failing-container', {
        container: new Container({
            args: ['exit 123'],
            command: ['sh', '-c'],
            image: 'alpine:3.6',
        }),
    });

    const exitCodeInputParameter = new InputParameter('exitCode');

    const echoContainerTemplate = new Template('echo-container', {
        container: new Container({
            args: ['echo "Exit code was: ' + simpleTag(exitCodeInputParameter) + '"'],
            command: ['sh', '-c'],
            image: 'alpine:3.6',
        }),
        inputs: new Inputs({
            parameters: [exitCodeInputParameter],
        }),
    });

    const exitCodeOutputVariableTemplate = new Template('exit-code-output-variable', {
        steps: [
            [
                new WorkflowStep('failing-container', {
                    continueOn: {
                        failed: true,
                    },
                    template: failingContainerTemplate,
                }),
            ],
            [
                new WorkflowStep('echo-container', {
                    arguments: new Arguments({
                        parameters: [
                            exitCodeInputParameter.toArgumentParameter({
                                value: '{{steps.failing-container.exitCode}}',
                            }),
                        ],
                    }),
                    template: echoContainerTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'exit-code-output-variable-',
        },
        spec: new WorkflowSpec({
            entrypoint: exitCodeOutputVariableTemplate,
        }),
    }).toWorkflow();
}
