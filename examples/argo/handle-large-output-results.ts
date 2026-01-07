import { Arguments } from '../../src/api/arguments';
import { InputArtifact } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { Outputs } from '../../src/api/outputs';
import { FromItemProperty, InputParameter, OutputParameter } from '../../src/api/parameter';
import { OutputArtifact } from '../../src/api/artifact';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../../src/api/expressions/tag';
import { ParameterValueFrom } from '../../src/api/parameter-value-from';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const itemsOutputArtifacts = new OutputArtifact('items', {
        path: '/tmp/items',
    });

    const countOutputParameter = new OutputParameter('count', {
        valueFrom: new ParameterValueFrom({
            path: '/tmp/count',
        }),
    });

    const getItemsTemplate = new Template('get-items', {
        container: new Container({
            args: ['echo \'["a", "b", "c"]\' > /tmp/items && echo \'3\' > /tmp/count'],
            command: ['/bin/sh', '-c'],
            image: 'alpine:latest',
        }),
        outputs: new Outputs({
            artifacts: [itemsOutputArtifacts],
            parameters: [countOutputParameter],
        }),
    });

    const indexInputParameter = new InputParameter('index');
    const itemsInputArtifact = new InputArtifact('items', {
        path: '/tmp/items',
    });

    const echoTemplate = new Template('echo', {
        container: new Container({
            args: [`cat /tmp/items | jq '.[${simpleTag(indexInputParameter)}]'`],
            command: ['sh', '-c'],
            image: 'stedolan/jq:latest',
        }),
        inputs: new Inputs({
            artifacts: [itemsInputArtifact],
            parameters: [indexInputParameter],
        }),
    });

    const getItemsStep = new WorkflowStep('get-items', {
        template: getItemsTemplate,
    });

    const handleLargeOutputResultsTemplate = new Template('handle-large-output-results', {
        steps: [
            [getItemsStep],
            [
                new WorkflowStep('sequence-param', {
                    arguments: new Arguments({
                        artifacts: [
                            itemsInputArtifact.toArgumentArtifact({
                                valueFromExpressionArgs: { workflowStep: getItemsStep, output: itemsOutputArtifacts },
                            }),
                        ],
                        parameters: [
                            indexInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    template: echoTemplate,
                    withSequence: {
                        count: simpleTag({ workflowStep: getItemsStep, output: countOutputParameter }).toString(),
                    },
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'handle-large-output-results-',
        },
        spec: new WorkflowSpec({
            entrypoint: handleLargeOutputResultsTemplate,
        }),
    }).toWorkflow();
}
