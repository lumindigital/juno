import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { FromItemProperty, InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');
    const tagInputParameter = new InputParameter('tag');

    const echoTemplate = new Template('echo', {
        container: new Container({
            command: ['echo', simpleTag(messageInputParameter)],
            image: 'alpine:3.7',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter, tagInputParameter],
        }),
        metrics: {
            prometheus: [
                {
                    gauge: {
                        realtime: false,
                        value: '{{duration}}',
                    },
                    help: 'Duration gauge by task name in seconds - task level',
                    labels: [
                        {
                            key: 'playground_task_name',
                            value: simpleTag(tagInputParameter),
                        },
                        {
                            key: 'status',
                            value: '{{status}}',
                        },
                    ],
                    name: 'playground_workflow_duration_task_seconds',
                },
                {
                    counter: {
                        value: '1',
                    },
                    help: 'Count of task execution by result status  - task level',
                    labels: [
                        {
                            key: 'playground_task_name_counter',
                            value: simpleTag(tagInputParameter),
                        },
                        {
                            key: 'status',
                            value: '{{status}}',
                        },
                    ],
                    name: 'playground_workflow_result_task_counter',
                },
            ],
        },
    });

    const dagTaskTemplate = new Template('dag-task', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('TEST-ONE', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: `console output-->TEST-${simpleTag(new FromItemProperty('command'))}`,
                            }),
                            tagInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty('tag'),
                            }),
                        ],
                    }),
                    template: echoTemplate,
                    withItems: [
                        { command: 'ONE-A', tag: 'TEST-ONE-A' },
                        { command: 'ONE-B', tag: 'TEST-ONE-B' },
                    ],
                }),
                new DagTask('TEST-TWO', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                value: `console output-->TEST-${simpleTag(new FromItemProperty('command'))}`,
                            }),
                            tagInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty('tag'),
                            }),
                        ],
                    }),
                    template: echoTemplate,
                    withItems: [
                        { command: 'TWO-A', tag: 'TEST-TWO-A' },
                        { command: 'TWO-B', tag: 'TEST-TWO-B' },
                    ],
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-task-',
        },
        spec: new WorkflowSpec({
            entrypoint: dagTaskTemplate,
            metrics: {
                prometheus: [
                    {
                        gauge: {
                            realtime: false,
                            value: '{{workflow.duration}}',
                        },
                        help: 'Duration gauge by workflow level',
                        labels: [
                            {
                                key: 'playground_id_workflow',
                                value: 'test',
                            },
                            {
                                key: 'status',
                                value: '{{workflow.status}}',
                            },
                        ],
                        name: 'playground_workflow_duration',
                    },
                    {
                        counter: {
                            value: '1',
                        },
                        help: 'Count of workflow execution by result status  - workflow level',
                        labels: [
                            {
                                key: 'playground_id_workflow_counter',
                                value: 'test',
                            },
                            {
                                key: 'status',
                                value: '{{workflow.status}}',
                            },
                        ],
                        name: 'playground_workflow_result_counter',
                    },
                ],
            },
        }),
    }).toWorkflow();
}
