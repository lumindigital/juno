import { Arguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expression';
import { Inputs } from '../../src/api/inputs';
import { FromItemProperty, InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const imageInputParameter = new InputParameter('image');
    const tagInputParameter = new InputParameter('tag');

    const catOsReleaseTemplate = new Template('cat-os-release', {
        container: new Container({
            args: ['/etc/os-release'],
            command: ['cat'],
            image: `${simpleTag(imageInputParameter)}:${simpleTag(tagInputParameter)}`,
        }),
        inputs: new Inputs({
            parameters: [imageInputParameter, tagInputParameter],
        }),
    });

    const loopMapExampleTemplate = new Template('loop-map-example', {
        steps: [
            [
                new WorkflowStep('test-linux', {
                    arguments: new Arguments({
                        parameters: [
                            imageInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty('image'),
                            }),
                            tagInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty('tag'),
                            }),
                        ],
                    }),
                    template: catOsReleaseTemplate,
                    withItems: [
                        { image: 'debian', tag: '9.1' },
                        { image: 'debian', tag: '8.9' },
                        { image: 'alpine', tag: '3.6' },
                        { image: 'ubuntu', tag: '17.10' },
                    ],
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'loops-maps-',
        },
        spec: new WorkflowSpec({
            entrypoint: loopMapExampleTemplate,
        }),
    }).toWorkflow();
}
