import { Arguments } from '../src/api/arguments';
import { OutputArtifact, InputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const outParameterOutputParam = new OutputParameter('out-parameter', {
        valueFrom: {
            path: '/tmp/my-output-parameter.txt',
        },
    });

    const outArtifactOutputArt = new OutputArtifact('out-artifact', {
        path: '/tmp/my-output-artifact.txt',
    });

    const generateTemplate = new Template('generate', {
        container: new Container({
            args: [
                " echo hello world | tee /tmp/my-output-artifact.txt && echo 'my-output-parameter' > /tmp/my-output-parameter.txt",
            ],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        outputs: new Outputs({
            artifacts: [outArtifactOutputArt],
            parameters: [outParameterOutputParam],
        }),
    });

    const inParameterInputParam = new InputParameter('in-parameter');
    const inArtifactInputArt = new InputArtifact('in-artifact', {
        path: '/tmp/art',
    });

    const consumeTemplate = new Template('consume', {
        container: new Container({
            args: [
                " echo 'input parameter value: {{inputs.parameters.in-parameter}}' && echo 'input artifact contents:' && cat /tmp/art",
            ],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
        inputs: new Inputs({
            artifacts: [inArtifactInputArt],
            parameters: [inParameterInputParam],
        }),
    });

    const nestedInParameterInputParam = new InputParameter('nested-in-parameter');
    const nestedInArtifactInputArt = new InputArtifact('nested-in-artifact');

    const consumeStep = new WorkflowStep('consume', {
        arguments: new Arguments({
            artifacts: [
                inArtifactInputArt.toArgumentArtifact({
                    from: '{{inputs.artifacts.nested-in-artifact}}',
                }),
            ],
            parameters: [
                inParameterInputParam.toArgumentParameter({ value: '{{inputs.parameters.nested-in-parameter}}' }),
            ],
        }),
        template: consumeTemplate,
    });

    const generateStep = new WorkflowStep('generate', {
        template: generateTemplate,
    });

    const nestedWfTemplate = new Template('nested-wf', {
        inputs: new Inputs({
            artifacts: [nestedInArtifactInputArt],
            parameters: [nestedInParameterInputParam],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('nested-out-artifact', {
                    from: '{{steps.generate.outputs.artifacts.out-artifact}}',
                }),
            ],
            parameters: [
                new OutputParameter('nested-out-parameter', {
                    valueFrom: {
                        parameter: '{{steps.generate.outputs.parameters.out-parameter}}',
                    },
                }),
            ],
        }),
        steps: [[consumeStep, generateStep]],
    });

    const nestedWorkflowExampleTemplate = new Template('nested-workflow-example', {
        steps: [
            [
                new WorkflowStep('generate', {
                    template: generateTemplate,
                }),
            ],
            [
                new WorkflowStep('nested-wf', {
                    arguments: new Arguments({
                        artifacts: [
                            nestedInArtifactInputArt.toArgumentArtifact({
                                from: '{{steps.generate.outputs.artifacts.out-artifact}}',
                            }),
                        ],
                        parameters: [
                            nestedInParameterInputParam.toArgumentParameter({
                                value: '{{steps.generate.outputs.parameters.out-parameter}}',
                            }),
                        ],
                    }),
                    template: nestedWfTemplate,
                }),
            ],
            [
                new WorkflowStep('consume', {
                    arguments: new Arguments({
                        artifacts: [
                            inArtifactInputArt.toArgumentArtifact({
                                from: '{{steps.nested-wf.outputs.artifacts.nested-out-artifact}}',
                            }),
                        ],
                        parameters: [
                            inParameterInputParam.toArgumentParameter({
                                value: '{{steps.nested-wf.outputs.parameters.nested-out-parameter}}',
                            }),
                        ],
                    }),
                    template: consumeTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'nested-workflow-',
        },
        spec: new WorkflowSpec({
            entrypoint: nestedWorkflowExampleTemplate,
        }),
    }).toWorkflow();
}
