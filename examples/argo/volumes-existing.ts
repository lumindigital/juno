import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const appendToAccesslogTemplate = new Template('append-to-accesslog', {
        container: new Container({
            args: ['echo accessed at: $(date) | tee -a /mnt/vol/accesslog'],
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

    const printAccesslogTemplate = new Template('print-accesslog', {
        container: new Container({
            args: ["echo 'Volume access log:'; cat /mnt/vol/accesslog"],
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

    const volumesExistingExampleTemplate = new Template('volumes-existing-example', {
        steps: [
            [
                new WorkflowStep('generate', {
                    template: appendToAccesslogTemplate,
                }),
            ],
            [
                new WorkflowStep('print', {
                    template: printAccesslogTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'volumes-existing-',
        },
        spec: new WorkflowSpec({
            entrypoint: volumesExistingExampleTemplate,
            volumes: [
                {
                    name: 'workdir',
                    persistentVolumeClaim: {
                        claimName: 'my-existing-volume',
                    },
                },
            ],
        }),
    }).toWorkflow();
}
