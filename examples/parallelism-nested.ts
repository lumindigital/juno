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
    const seqIdInputParameter = new InputParameter('seq-id');
    const parallelIdInputParameter = new InputParameter('parallel-id');

    const oneJobTemplate = new Template('one-job', {
        container: new Container({
            args: ['echo {{inputs.parameters.parallel-id}} {{inputs.parameters.seq-id}}; sleep 10'],
            command: ['/bin/sh', '-c'],
            image: 'alpine',
        }),
        inputs: new Inputs({
            parameters: [seqIdInputParameter, parallelIdInputParameter],
        }),
    });

    const seqListInputParameter = new InputParameter('seq-list');

    const seqWorkerTemplate = new Template('seq-worker', {
        inputs: new Inputs({
            parameters: [seqListInputParameter, parallelIdInputParameter],
        }),
        parallelism: 1,
        steps: [
            [
                new WorkflowStep('seq-step', {
                    arguments: new Arguments({
                        parameters: [
                            parallelIdInputParameter.toArgumentParameter({
                                value: '{{inputs.parameters.parallel-id}}',
                            }),
                            seqIdInputParameter.toArgumentParameter({ value: '{{item}}' }),
                        ],
                    }),
                    template: oneJobTemplate,
                    withParam: '{{inputs.parameters.seq-list}}',
                }),
            ],
        ],
    });

    const parallelListInputParameter = new InputParameter('parallel-list');

    const parallelWorkerTemplate = new Template('parallel-worker', {
        inputs: new Inputs({
            parameters: [seqListInputParameter, parallelListInputParameter],
        }),
        steps: [
            [
                new WorkflowStep('parallel-worker', {
                    arguments: new Arguments({
                        parameters: [
                            seqListInputParameter.toArgumentParameter({ value: '{{inputs.parameters.seq-list}}' }),
                            parallelIdInputParameter.toArgumentParameter({ value: '{{item}}' }),
                        ],
                    }),
                    template: seqWorkerTemplate,
                    withParam: '{{inputs.parameters.parallel-list}}',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'parallelism-nested-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('seq-list', {
                        value: '["a","b","c","d"]\n',
                    }),
                    new WorkflowParameter('parallel-list', {
                        value: '[1,2,3,4]\n',
                    }),
                ],
            }),
            entrypoint: parallelWorkerTemplate,
        }),
    }).toWorkflow();
}
