import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { FromItemProperty, InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const secondsInputParameter = new InputParameter('seconds');

    const acquireLockTemplate = new Template('acquire-lock', {
        container: new Container({
            args: ['sleep 10; echo acquired lock'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        synchronization: {
            semaphores: [
                {
                    configMapKeyRef: {
                        key: 'template',
                        name: 'my-config',
                    },
                },
            ],
        },
    });

    const synchronizationTmplLevelExampleTemplate = new Template('synchronization-tmpl-level-example', {
        steps: [
            [
                new WorkflowStep('synchronization-acquire-lock', {
                    arguments: new Arguments({
                        parameters: [
                            secondsInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    template: acquireLockTemplate,
                    withParamExpression: '["1","2","3","4","5"]',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'synchronization-tmpl-level-',
        },
        spec: new WorkflowSpec({
            entrypoint: synchronizationTmplLevelExampleTemplate,
        }),
    }).toWorkflow();
}
