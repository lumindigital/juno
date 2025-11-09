import { Arguments } from '../src/api/arguments';
import { OutputArtifact, InputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const outParameterOutputParameter = new OutputParameter('out-parameter', {
        valueFrom: {
            path: '/tmp/my-output-parameter.txt',
        },
    });

    const outArtifactOutputArtifact = new OutputArtifact('out-artifact', {
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
            artifacts: [outArtifactOutputArtifact],
            parameters: [outParameterOutputParameter],
        }),
    });

    const inParameterInputParameter = new InputParameter('in-parameter');
    const inArtifactInputArtifact = new InputArtifact('in-artifact', {
        path: '/tmp/art',
    });

    const consumeTemplate = new Template('consume', {
        container: new Container({
            args: [
                ` echo 'input parameter value: ${simpleTag(inParameterInputParameter)}' && echo 'input artifact contents:' && cat /tmp/art`,
            ],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
        inputs: new Inputs({
            artifacts: [inArtifactInputArtifact],
            parameters: [inParameterInputParameter],
        }),
    });

    const nestedInParameterInputParameter = new InputParameter('nested-in-parameter');
    const nestedInArtifactInputArtifact = new InputArtifact('nested-in-artifact');

    const consumeStep = new WorkflowStep('consume', {
        arguments: new Arguments({
            artifacts: [
                inArtifactInputArtifact.toArgumentArtifact({
                    valueFromExpressionArgs: nestedInArtifactInputArtifact,
                }),
            ],
            parameters: [
                inParameterInputParameter.toArgumentParameter({
                    valueFromExpressionArgs: nestedInParameterInputParameter,
                }),
            ],
        }),
        template: consumeTemplate,
    });

    const generateStep = new WorkflowStep('generate', {
        template: generateTemplate,
    });

    const nestedOutputArtifact = new OutputArtifact('nested-out-artifact', {
        valueFromExpressionArgs: { workflowStep: generateStep, output: outArtifactOutputArtifact },
    });

    const nestedOutputParameter = new OutputParameter('nested-out-parameter', {
        valueFrom: {
            parameter: simpleTag({ workflowStep: generateStep, output: outParameterOutputParameter }),
        },
    });

    const nestedWfTemplate = new Template('nested-wf', {
        inputs: new Inputs({
            artifacts: [nestedInArtifactInputArtifact],
            parameters: [nestedInParameterInputParameter],
        }),
        outputs: new Outputs({
            artifacts: [nestedOutputArtifact],
            parameters: [nestedOutputParameter],
        }),
        steps: [[consumeStep, generateStep]],
    });

    const nestedWfStep = new WorkflowStep('nested-wf', {
        arguments: new Arguments({
            artifacts: [
                nestedInArtifactInputArtifact.toArgumentArtifact({
                    valueFromExpressionArgs: { workflowStep: generateStep, output: outArtifactOutputArtifact },
                }),
            ],
            parameters: [
                nestedInParameterInputParameter.toArgumentParameter({
                    valueFromExpressionArgs: { workflowStep: generateStep, output: outParameterOutputParameter },
                }),
            ],
        }),
        template: nestedWfTemplate,
    });

    const nestedWorkflowExampleTemplate = new Template('nested-workflow-example', {
        steps: [
            [
                new WorkflowStep('generate', {
                    template: generateTemplate,
                }),
            ],
            [nestedWfStep],
            [
                new WorkflowStep('consume', {
                    arguments: new Arguments({
                        artifacts: [
                            inArtifactInputArtifact.toArgumentArtifact({
                                valueFromExpressionArgs: {
                                    workflowStep: nestedWfStep,
                                    output: nestedOutputArtifact,
                                },
                            }),
                        ],
                        parameters: [
                            inParameterInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: {
                                    workflowStep: nestedWfStep,
                                    output: nestedOutputParameter,
                                },
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
