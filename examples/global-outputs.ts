import { Arguments } from '../src/api/arguments';
import { OutputArtifact, InputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { OutputParameter, InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const myGlobalParam = new OutputParameter('hello-param', {
        globalName: 'my-global-param',
        valueFrom: {
            path: '/tmp/hello_world.txt',
        },
    });

    const globalOutputTemplate = new Template('global-output', {
        container: new Container({
            args: ['sleep 1; echo -n hello world > /tmp/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('hello-art', {
                    globalName: 'my-global-art',
                    path: '/tmp/hello_world.txt',
                }),
            ],
            parameters: [myGlobalParam],
        }),
    });

    const paramInputParameter = new InputParameter('param', {
        valueFromExpressionArgs: { workflowOutput: myGlobalParam },
    });

    // const paramInputParameter = new InputParameter('param', {
    //     value: '{{workflow.outputs.parameters.my-global-param}}',
    // });

    const consumeGlobalParamTemplate = new Template('consume-global-param', {
        container: new Container({
            args: ['echo {{inputs.parameters.param}}'],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
        inputs: new Inputs({
            parameters: [paramInputParameter],
        }),
    });

    const artInputArtifact = new InputArtifact('art', {
        path: '/art',
    });

    const consumeGlobalArtTemplate = new Template('consume-global-art', {
        container: new Container({
            args: ['cat /art'],
            command: ['sh', '-c'],
            image: 'alpine:3.7',
        }),
        inputs: new Inputs({
            artifacts: [artInputArtifact],
        }),
    });

    const consumeGlobalsTemplate = new Template('consume-globals', {
        steps: [
            [
                new WorkflowStep('consume-global-param', {
                    template: consumeGlobalParamTemplate,
                }),
                new WorkflowStep('consume-global-art', {
                    arguments: new Arguments({
                        artifacts: [
                            artInputArtifact.toArgumentArtifact({
                                from: '{{workflow.outputs.artifacts.my-global-art}}',
                            }),
                        ],
                    }),
                    template: consumeGlobalArtTemplate,
                }),
            ],
        ],
    });

    const generateGlobalsTemplate = new Template('generate-globals', {
        steps: [
            [
                new WorkflowStep('generate', {
                    template: globalOutputTemplate,
                }),
            ],
            [
                new WorkflowStep('consume-globals', {
                    template: consumeGlobalsTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'global-outputs-',
        },
        spec: new WorkflowSpec({
            entrypoint: generateGlobalsTemplate,
            onExit: consumeGlobalsTemplate,
        }),
    }).toWorkflow();
}
