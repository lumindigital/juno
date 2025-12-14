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
            args: ['sleep 20; echo acquired lock'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        synchronization: {
            mutex: {
                name: 'welcome',
            },
        },
    });

    const acquireLock1Template = new Template('acquire-lock-1', {
        container: new Container({
            args: ['sleep 50; echo acquired lock'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        synchronization: {
            mutex: {
                name: 'test',
            },
        },
    });

    const synchronizationTmplLevelMutexExampleTemplate = new Template('synchronization-tmpl-level-mutex-example', {
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
                new WorkflowStep('synchronization-acquire-lock1', {
                    arguments: new Arguments({
                        parameters: [
                            secondsInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    template: acquireLock1Template,
                    withParamExpression: '["1","2","3","4","5"]',
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'synchronization-tmpl-level-mutex-',
        },
        spec: new WorkflowSpec({
            entrypoint: synchronizationTmplLevelMutexExampleTemplate,
        }),
    }).toWorkflow();
}
