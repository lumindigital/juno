import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
            resources: {
                limits: {
                    cpu: '100m',
                    memory: '32Mi',
                },
            },
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'test-dns-config-',
        },
        spec: new WorkflowSpec({
            dnsConfig: {
                nameservers: ['1.2.3.4'],
                options: [
                    {
                        name: 'ndots',
                        value: '2',
                    },
                ],
            },
            entrypoint: helloWorldTemplate,
        }),
    }).toWorkflow();
}
