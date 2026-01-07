import { Arguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const serverIpInputParameter = new InputParameter('server-ip');

    const nginxServerTemplate = new Template('nginx-server', {
        container: new Container({
            image: 'nginx:1.13',
            readinessProbe: {
                httpGet: {
                    path: '/',
                    port: '80',
                },
                initialDelaySeconds: 2,
                timeoutSeconds: 1,
            },
        }),
        daemon: true,
    });

    const nginxClientTemplate = new Template('nginx-client', {
        container: new Container({
            args: [
                `echo curl --silent -G http://${simpleTag(serverIpInputParameter)}:80/ && curl --silent -G http://${simpleTag(serverIpInputParameter)}:80/`,
            ],
            command: ['/bin/sh', '-c'],
            image: 'appropriate/curl:latest',
        }),
        inputs: new Inputs({
            parameters: [serverIpInputParameter],
        }),
    });

    const nginxServerStep = new WorkflowStep('nginx-server', {
        template: nginxServerTemplate,
    });

    const daemonNginxExampleTemplate = new Template('daemon-nginx-example', {
        steps: [
            [nginxServerStep],
            [
                new WorkflowStep('nginx-client', {
                    arguments: new Arguments({
                        parameters: [
                            serverIpInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: { workflowStep: nginxServerStep, output: 'ip' },
                            }),
                        ],
                    }),
                    template: nginxClientTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'daemon-nginx-',
        },
        spec: new WorkflowSpec({
            entrypoint: daemonNginxExampleTemplate,
        }),
    }).toWorkflow();
}
