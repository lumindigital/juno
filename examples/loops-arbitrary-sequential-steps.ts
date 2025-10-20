import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const exitCodeInputParameter = new InputParameter('exit_code');
    const messageInputParameter = new InputParameter('message');

    const unitStepTemplate = new Template('unit-step-template', {
        container: new Container({
            args: ['echo {{inputs.parameters.message}}; exit {{inputs.parameters.exit_code}}'],
            command: ['/bin/sh', '-c'],
            image: 'alpine',
        }),
        inputs: new Inputs({
            parameters: [exitCodeInputParameter, messageInputParameter],
        }),
    });

    const stepParamsInputParameter = new InputParameter('step_params');

    const loopArbitrarySequentialStepsExampleTemplate = new Template('loop-arbitrary-sequential-steps-example', {
        failFast: true,
        inputs: new Inputs({
            parameters: [stepParamsInputParameter],
        }),
        parallelism: 1,
        steps: [
            [
                new WorkflowStep('unit-step', {
                    arguments: new Arguments({
                        parameters: [
                            exitCodeInputParameter.toArgumentParameter({ value: '{{item.exit_code}}' }),
                            messageInputParameter.toArgumentParameter({ value: '{{item.message}}' }),
                        ],
                    }),
                    template: unitStepTemplate,
                    withParam: '{{inputs.parameters.step_params}}',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'loop-arbitrary-sequential-steps-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('step_params', {
                        value: '[\n  { "exit_code": 0, "message": "succeeds 1" },\n  { "exit_code": 0, "message": "succeeds 2" },\n  { "exit_code": 0, "message": "succeeds 3" },\n  { "exit_code": 1, "message": "will fail and stop here" },\n  { "exit_code": 0, "message": "will not run" },\n  { "exit_code": 0, "message": "will not run" }\n]\n',
                    }),
                ],
            }),
            entrypoint: loopArbitrarySequentialStepsExampleTemplate,
        }),
    }).toWorkflow();
}
