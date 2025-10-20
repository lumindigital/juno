import { Container } from '../src/api/container';
import { EnvironmentVariable } from '../src/api/environment-variable';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const printSecretTemplate = new Template('print-secret', {
        container: new Container({
            args: [
                ' echo "secret from env: $MYSECRETPASSWORD"; echo "secret from file: `cat /secret/mountpath/mypassword`"',
            ],
            command: ['sh', '-c'],
            env: [
                new EnvironmentVariable('MYSECRETPASSWORD', {
                    valueFrom: {
                        secretKeyRef: {
                            key: 'mypassword',
                            name: 'my-secret',
                        },
                    },
                }),
            ],
            image: 'alpine:3.7',
            volumeMounts: [
                {
                    mountPath: '/secret/mountpath',
                    name: 'my-secret-vol',
                },
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'secrets-',
        },
        spec: new WorkflowSpec({
            entrypoint: printSecretTemplate,
            volumes: [
                {
                    name: 'my-secret-vol',
                    secret: {
                        secretName: 'my-secret',
                    },
                },
            ],
        }),
    }).toWorkflow();
}
