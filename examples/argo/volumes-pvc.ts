import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldToFileTemplate = new Template('hello-world-to-file', {
        container: new Container({
            args: ['echo generating message in volume; echo hello world | tee /mnt/vol/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'busybox',
            volumeMounts: [
                {
                    mountPath: '/mnt/vol',
                    name: 'workdir',
                },
            ],
        }),
    });

    const printMessageFromFileTemplate = new Template('print-message-from-file', {
        container: new Container({
            args: ['echo getting message from volume; find /mnt/vol; cat /mnt/vol/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
            volumeMounts: [
                {
                    mountPath: '/mnt/vol',
                    name: 'workdir',
                },
            ],
        }),
    });

    const volumesPvcExampleTemplate = new Template('volumes-pvc-example', {
        steps: [
            [
                new WorkflowStep('generate', {
                    template: helloWorldToFileTemplate,
                }),
            ],
            [
                new WorkflowStep('print', {
                    template: printMessageFromFileTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'volumes-pvc-',
        },
        spec: new WorkflowSpec({
            entrypoint: volumesPvcExampleTemplate,
            volumeClaimTemplates: [
                {
                    metadata: {
                        name: 'workdir',
                    },
                    spec: {
                        accessModes: ['ReadWriteOnce'],
                        resources: {
                            requests: {
                                storage: '1Gi',
                            },
                        },
                    },
                },
            ],
        }),
    }).toWorkflow();
}
