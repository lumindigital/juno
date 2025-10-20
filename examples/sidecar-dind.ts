import { Container } from '../src/api/container';
import { EnvironmentVariable } from '../src/api/environment-variable';
import { Template } from '../src/api/template';
import { UserContainer } from '../src/api/user-container';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const dindSidecarExampleTemplate = new Template('dind-sidecar-example', {
        container: new Container({
            args: ['until docker ps; do sleep 3; done; docker run --rm debian:latest cat /etc/os-release'],
            command: ['sh', '-c'],
            env: [
                new EnvironmentVariable('DOCKER_HOST', {
                    value: '127.0.0.1',
                }),
            ],
            image: 'docker:19.03.13',
        }),
        sidecars: [
            new UserContainer('dind', {
                command: ['dockerd-entrypoint.sh'],
                env: [
                    new EnvironmentVariable('DOCKER_TLS_CERTDIR', {
                        value: '',
                    }),
                ],
                image: 'docker:19.03.13-dind',
                mirrorVolumeMounts: true,
                name: 'dind',
                securityContext: {
                    privileged: true,
                },
            }),
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'sidecar-dind-',
        },
        spec: new WorkflowSpec({
            entrypoint: dindSidecarExampleTemplate,
        }),
    }).toWorkflow();
}
