import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { UserContainer } from '../../src/api/user-container';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const sidecarExampleTemplate = new Template('sidecar-example', {
        container: new Container({
            args: [
                " apk update && apk add curl && until curl -XPOST 'http://127.0.0.1:8086/query' --data-urlencode 'q=CREATE DATABASE mydb' ; do sleep .5; done && for i in $(seq 1 20); do curl -XPOST 'http://127.0.0.1:8086/write?db=mydb' -d \"cpu,host=server01,region=uswest load=$i\" ; sleep .5 ; done",
            ],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        sidecars: [
            new UserContainer('influxdb', {
                command: ['influxd'],
                image: 'influxdb:1.2',
            }),
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'sidecar-',
        },
        spec: new WorkflowSpec({
            entrypoint: sidecarExampleTemplate,
        }),
    }).toWorkflow();
}
