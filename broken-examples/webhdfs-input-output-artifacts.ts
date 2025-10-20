import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const inputOutputArtifactWebhdfsExampleTemplate = new Template('input-output-artifact-webhdfs-example', {
        container: new Container({
            args: ['cat /my-artifact'],
            command: ['sh', '-c'],
            image: 'debian:latest',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('my-art', {
                    http: {
                        auth: {
                            oauth2: {
                                clientIDSecret: {
                                    key: 'clientID',
                                    name: 'oauth-sec',
                                },
                                clientSecretSecret: {
                                    key: 'clientSecret',
                                    name: 'oauth-sec',
                                },
                                endpointParams: [
                                    {
                                        key: 'customkey',
                                        value: 'customvalue',
                                    },
                                ],
                                scopes: ['some', 'scopes'],
                                tokenURLSecret: {
                                    key: 'tokenURL',
                                    name: 'oauth-sec',
                                },
                            },
                        },
                        headers: [
                            {
                                name: 'CustomHeader',
                                value: 'CustomValue',
                            },
                        ],
                        url: 'https://mywebhdfsprovider.com/webhdfs/v1/file.txt?op=OPEN',
                    },
                    path: '/my-artifact',
                }),
            ],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('my-art2', {
                    http: {
                        auth: {
                            clientCert: {
                                clientCertSecret: {
                                    key: 'certificate.pem',
                                    name: 'cert-sec',
                                },
                                clientKeySecret: {
                                    key: 'key.pem',
                                    name: 'cert-sec',
                                },
                            },
                        },
                        headers: [
                            {
                                name: 'CustomHeader',
                                value: 'CustomValue',
                            },
                        ],
                        url: 'https://mywebhdfsprovider.com/webhdfs/v1/file.txt?op=CREATE&overwrite=true',
                    },
                    path: '/my-artifact',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'input-output-artifact-webhdfs-',
        },
        spec: new WorkflowSpec({
            entrypoint: inputOutputArtifactWebhdfsExampleTemplate,
        }),
    }).toWorkflow();
}
