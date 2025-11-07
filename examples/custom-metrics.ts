import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Outputs } from '../src/api/outputs';
import { OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const randIntValue = new OutputParameter('rand-int-value', {
        globalName: 'rand-int-value',
        valueFrom: {
            path: '/tmp/rand_int.txt',
        },
    });

    const randomIntTemplate = new Template('random-int', {
        container: new Container({
            args: ['RAND_INT=$((1 + RANDOM % 10)); echo $RAND_INT; echo $RAND_INT > /tmp/rand_int.txt'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        metrics: {
            prometheus: [
                {
                    help: 'Value of the int emitted by random-int at step level',
                    histogram: {
                        buckets: [2.01, 4.01, 6.01, 8.01, 10.01],
                        value: simpleTag(randIntValue),
                    },
                    name: 'random_int_step_histogram',
                    when: '{{status}} == Succeeded',
                },
                {
                    gauge: {
                        realtime: true,
                        value: '{{duration}}',
                    },
                    help: 'Duration gauge by name',
                    labels: [
                        {
                            key: 'name',
                            value: 'random-int',
                        },
                    ],
                    name: 'duration_gauge',
                },
            ],
        },
        outputs: new Outputs({
            parameters: [randIntValue],
        }),
    });

    const flakeyTemplate = new Template('flakey', {
        container: new Container({
            args: ['import random; import sys; exit_code = random.choice([0, 1, 1]); sys.exit(exit_code)'],
            command: ['python', '-c'],
            image: 'python:alpine3.6',
        }),
        metrics: {
            prometheus: [
                {
                    counter: {
                        value: '1',
                    },
                    help: 'Count of step execution by result status',
                    labels: [
                        {
                            key: 'name',
                            value: 'flakey',
                        },
                        {
                            key: 'status',
                            value: '{{status}}',
                        },
                    ],
                    name: 'result_counter',
                },
            ],
        },
    });

    const stepsTemplate = new Template('steps', {
        metrics: {
            prometheus: [
                {
                    gauge: {
                        realtime: true,
                        value: '{{duration}}',
                    },
                    help: 'Duration gauge by name',
                    labels: [
                        {
                            key: 'name',
                            value: 'steps',
                        },
                    ],
                    name: 'duration_gauge',
                },
            ],
        },
        steps: [
            [
                new WorkflowStep('random-int', {
                    template: randomIntTemplate,
                }),
            ],
            [
                new WorkflowStep('flakey', {
                    template: flakeyTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'hello-world-',
        },
        spec: new WorkflowSpec({
            entrypoint: stepsTemplate,
            metrics: {
                prometheus: [
                    {
                        gauge: {
                            realtime: true,
                            value: '{{workflow.duration}}',
                        },
                        help: 'Duration gauge by name',
                        labels: [
                            {
                                key: 'name',
                                value: 'workflow',
                            },
                        ],
                        name: 'duration_gauge',
                    },
                ],
            },
        }),
    }).toWorkflow();
}
