import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { FromItemProperty, InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const seqIdInputParameter = new InputParameter('seq-id');

    const oneJobTemplate = new Template('one-job', {
        container: new Container({
            args: [`echo ${simpleTag(seqIdInputParameter)}; sleep 30`],
            command: ['/bin/sh', '-c'],
            image: 'alpine',
        }),
        inputs: new Inputs({
            parameters: [seqIdInputParameter],
        }),
    });

    const bTemplate = new Template('B', {
        inputs: new Inputs({
            parameters: [seqIdInputParameter],
        }),
        steps: [
            [
                new WorkflowStep('jobs', {
                    arguments: new Arguments({
                        parameters: [
                            seqIdInputParameter.toArgumentParameter({ valueFromExpressionArgs: seqIdInputParameter }),
                        ],
                    }),
                    template: oneJobTemplate,
                    withParamExpression: '[1, 2]',
                }),
            ],
        ],
    });

    const seqListInputParameter = new InputParameter('seq-list');

    const aTemplate = new Template('A', {
        inputs: new Inputs({
            parameters: [seqListInputParameter],
        }),
        parallelism: 1,
        steps: [
            [
                new WorkflowStep('seq-step', {
                    arguments: new Arguments({
                        parameters: [
                            seqIdInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    template: bTemplate,
                    withParamExpression: simpleTag(seqListInputParameter),
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'parallelism-nested-workflow-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    seqListInputParameter.toWorkflowParameter({
                        value: '["a","b","c","d"]\n',
                    }),
                ],
            }),
            entrypoint: aTemplate,
        }),
    }).toWorkflow();
}
