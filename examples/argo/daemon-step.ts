import { Arguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { simpleTag } from '../../src/api/expression';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const influxdbTemplate = new Template('influxdb', {
        container: new Container({
            image: 'influxdb:1.2',
            readinessProbe: {
                httpGet: {
                    path: '/ping',
                    port: '8086',
                },
                initialDelaySeconds: 5,
                timeoutSeconds: 1,
            },
        }),
        daemon: true,
    });

    const cmdInputParameter = new InputParameter('cmd');

    const influxdbClientTemplate = new Template('influxdb-client', {
        container: new Container({
            args: [simpleTag(cmdInputParameter)],
            command: ['sh', '-c'],
            image: 'appropriate/curl:latest',
        }),
        inputs: new Inputs({
            parameters: [cmdInputParameter],
        }),
    });

    const influxStep = new WorkflowStep('influx', {
        template: influxdbTemplate,
    });

    const daemonExampleTemplate = new Template('daemon-example', {
        steps: [
            [influxStep],
            [
                new WorkflowStep('init-database', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `curl -XPOST 'http://${simpleTag({ workflowStep: influxStep, output: 'ip' })}:8086/query' --data-urlencode "q=CREATE DATABASE mydb"`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
            ],
            [
                new WorkflowStep('producer-1', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `for i in $(seq 1 20); do curl -XPOST 'http://${simpleTag({ workflowStep: influxStep, output: 'ip' })}:8086/write?db=mydb' -d "cpu,host=server01,region=uswest load=$i" ; sleep .5 ; done`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
                new WorkflowStep('producer-2', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `for i in $(seq 1 20); do curl -XPOST 'http://${simpleTag({ workflowStep: influxStep, output: 'ip' })}:8086/write?db=mydb' -d "cpu,host=server02,region=uswest load=$((RANDOM % 100))" ; sleep .5 ; done`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
                new WorkflowStep('producer-3', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `curl -XPOST 'http://${simpleTag({ workflowStep: influxStep, output: 'ip' })}:8086/write?db=mydb' -d 'cpu,host=server03,region=useast load=15.4'`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
            ],
            [
                new WorkflowStep('consumer', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `curl --silent -G http://${simpleTag({ workflowStep: influxStep, output: 'ip' })}:8086/query?pretty=true --data-urlencode "db=mydb" --data-urlencode "q=SELECT * FROM cpu"`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'daemon-step-',
        },
        spec: new WorkflowSpec({
            entrypoint: daemonExampleTemplate,
        }),
    }).toWorkflow();
}
