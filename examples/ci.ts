import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { InputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const revisionInputParameter = new InputParameter('revision');

    const buildGolangExampleTemplate = new Template('build-golang-example', {
        container: new Container({
            args: ['cd /go/src/github.com/golang/example/hello && git status && go build -v .'],
            command: ['sh', '-c'],
            image: 'golang:1.8',
            volumeMounts: [
                {
                    mountPath: '/go',
                    name: 'workdir',
                },
            ],
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('code', {
                    git: {
                        repo: 'https://github.com/golang/example.git',
                        revision: '{{inputs.parameters.revision}}',
                    },
                    path: '/go/src/github.com/golang/example',
                }),
            ],
            parameters: [revisionInputParameter],
        }),
    });

    const osImageInputParameter = new InputParameter('os-image');

    const runHelloTemplate = new Template('run-hello', {
        container: new Container({
            args: ['uname -a ; cat /etc/os-release ; /go/src/github.com/golang/example/hello/hello'],
            command: ['sh', '-c'],
            image: '{{inputs.parameters.os-image}}',
            volumeMounts: [
                {
                    mountPath: '/go',
                    name: 'workdir',
                },
            ],
        }),
        inputs: new Inputs({
            parameters: [osImageInputParameter],
        }),
    });

    const ciExampleTemplate = new Template('ci-example', {
        inputs: new Inputs({
            parameters: [revisionInputParameter],
        }),
        steps: [
            [
                new WorkflowStep('build', {
                    arguments: new Arguments({
                        parameters: [
                            revisionInputParameter.toArgumentParameter({ value: '{{inputs.parameters.revision}}' }),
                        ],
                    }),
                    template: buildGolangExampleTemplate,
                }),
            ],
            [
                new WorkflowStep('test', {
                    arguments: new Arguments({
                        parameters: [
                            osImageInputParameter.toArgumentParameter({ value: '{{item.image}}:{{item.tag}}' }),
                        ],
                    }),
                    template: runHelloTemplate,
                    withItems: [
                        { image: 'debian', tag: '9.1' },
                        { image: 'alpine', tag: '3.6' },
                        { image: 'ubuntu', tag: '17.10' },
                    ],
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'ci-example-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [new WorkflowParameter('revision', { value: 'cfe12d6' })],
            }),
            entrypoint: ciExampleTemplate,
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
