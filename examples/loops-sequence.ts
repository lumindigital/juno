import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const msgInputParameter = new InputParameter('msg');

    const echoTemplate = new Template('echo', {
        container: new Container({
            command: ['echo', simpleTag(msgInputParameter)],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [msgInputParameter],
        }),
    });

    const loopsSequenceTemplate = new Template('loops-sequence', {
        steps: [
            [
                new WorkflowStep('sequence-count', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    template: echoTemplate,
                    withSequence: {
                        count: '5',
                    },
                }),
                new WorkflowStep('sequence-start-end', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    template: echoTemplate,
                    withSequence: {
                        end: '105',
                        start: '100',
                    },
                }),
                new WorkflowStep('sequence-param', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    template: echoTemplate,
                    withSequence: {
                        count: '{{workflow.parameters.count}}',
                        start: '200',
                    },
                }),
                new WorkflowStep('sequence-negative', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    template: echoTemplate,
                    withSequence: {
                        end: '0',
                        start: '5',
                    },
                }),
                new WorkflowStep('sequence-format', {
                    arguments: new Arguments({
                        parameters: [msgInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    template: echoTemplate,
                    withSequence: {
                        count: '5',
                        format: 'testuser%02X',
                    },
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'loops-sequence-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('count', {
                        value: '3',
                    }),
                ],
            }),
            entrypoint: loopsSequenceTemplate,
        }),
    }).toWorkflow();
}
