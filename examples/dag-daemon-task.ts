import { Arguments } from '../src/api/arguments';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { and } from '../src/api/expression';
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

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
            args: ['{{inputs.parameters.cmd}}'],
            command: ['sh', '-c'],
            image: 'appropriate/curl:latest',
        }),
        inputs: new Inputs({
            parameters: [cmdInputParameter],
        }),
    });

    const influxTask = new DagTask('influx', {
        template: influxdbTemplate,
    });

    const initDatabaseTask = new DagTask('init-database', {
        arguments: new Arguments({
            parameters: [
                cmdInputParameter.toArgumentParameter({
                    value: 'curl -XPOST \'http://{{tasks.influx.ip}}:8086/query\' --data-urlencode "q=CREATE DATABASE mydb"',
                }),
            ],
        }),
        depends: influxTask,
        template: influxdbClientTemplate,
    });

    const producer1Task = new DagTask('producer-1', {
        arguments: new Arguments({
            parameters: [
                cmdInputParameter.toArgumentParameter({
                    value: 'for i in $(seq 1 20); do curl -XPOST \'http://{{tasks.influx.ip}}:8086/write?db=mydb\' -d "cpu,host=server01,region=uswest load=$i" ; sleep .5 ; done',
                }),
            ],
        }),
        depends: initDatabaseTask,
        template: influxdbClientTemplate,
    });

    const producer2Task = new DagTask('producer-2', {
        arguments: new Arguments({
            parameters: [
                cmdInputParameter.toArgumentParameter({
                    value: 'for i in $(seq 1 20); do curl -XPOST \'http://{{tasks.influx.ip}}:8086/write?db=mydb\' -d "cpu,host=server02,region=uswest load=$((RANDOM % 100))" ; sleep .5 ; done',
                }),
            ],
        }),
        depends: initDatabaseTask,
        template: influxdbClientTemplate,
    });

    const producer3Task = new DagTask('producer-3', {
        arguments: new Arguments({
            parameters: [
                cmdInputParameter.toArgumentParameter({
                    value: "curl -XPOST 'http://{{tasks.influx.ip}}:8086/write?db=mydb' -d 'cpu,host=server03,region=useast load=15.4'",
                }),
            ],
        }),
        depends: initDatabaseTask,
        template: influxdbClientTemplate,
    });

    const daemonExampleTemplate = new Template('daemon-example', {
        dag: new DagTemplate({
            tasks: [
                influxTask,
                initDatabaseTask,
                producer1Task,
                producer2Task,
                producer3Task,
                new DagTask('consumer', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: 'curl --silent -G http://{{tasks.influx.ip}}:8086/query?pretty=true --data-urlencode "db=mydb" --data-urlencode "q=SELECT * FROM cpu"',
                            }),
                        ],
                    }),
                    depends: and([producer1Task, producer2Task, producer3Task]),
                    template: influxdbClientTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-daemon-task-',
        },
        spec: new WorkflowSpec({
            entrypoint: daemonExampleTemplate,
        }),
    }).toWorkflow();
}
