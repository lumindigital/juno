import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { FromItemProperty, InputParameter, WorkflowParameter } from '../src/api/parameter';
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
            args: [`echo ${simpleTag(parallelIdInputParameter)} ${simpleTag(seqIdInputParameter)}; sleep 10`],
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
                                valueFromExpressionArgs: parallelIdInputParameter,
                            }),
                            seqIdInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    template: oneJobTemplate,
                    withParam: simpleTag(seqListInputParameter),
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
                            seqListInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: seqListInputParameter,
                            }),
                            parallelIdInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    template: seqWorkerTemplate,
                    withParam: simpleTag(parallelListInputParameter),
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
