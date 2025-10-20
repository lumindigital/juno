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
    const osListInputParameter = new InputParameter('os-list');
    const imageInputParameter = new InputParameter('image');
    const tagInputParameter = new InputParameter('tag');

    const catOsReleaseTemplate = new Template('cat-os-release', {
        container: new Container({
            args: ['/etc/os-release'],
            command: ['cat'],
            image: '{{inputs.parameters.image}}:{{inputs.parameters.tag}}',
        }),
        inputs: new Inputs({
            parameters: [imageInputParameter, tagInputParameter],
        }),
    });

    const loopParamArgExampleTemplate = new Template('loop-param-arg-example', {
        inputs: new Inputs({
            parameters: [osListInputParameter],
        }),
        steps: [
            [
                new WorkflowStep('test-linux', {
                    arguments: new Arguments({
                        parameters: [
                            imageInputParameter.toArgumentParameter({ value: '{{item.image}}' }),
                            tagInputParameter.toArgumentParameter({ value: '{{item.tag}}' }),
                        ],
                    }),
                    template: catOsReleaseTemplate,
                    withParam: '{{inputs.parameters.os-list}}',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'loops-param-arg-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('os-list', {
                        value: '[\n  { "image": "debian", "tag": "9.1" },\n  { "image": "debian", "tag": "8.9" },\n  { "image": "alpine", "tag": "3.6" },\n  { "image": "ubuntu", "tag": "17.10" }\n]\n',
                    }),
                ],
            }),
            entrypoint: loopParamArgExampleTemplate,
        }),
    }).toWorkflow();
}
