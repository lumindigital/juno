import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { EnvironmentVariable } from '../src/api/environment-variable';
import { Inputs } from '../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowTemplate } from '../src/api/workflow-template';
import { IoArgoprojWorkflowV1Alpha1WorkflowTemplate } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1WorkflowTemplate> {
    const repoInputParameter = new InputParameter('repo');
    const branchInputParameter = new InputParameter('branch');

    const cloneTemplate = new Template('clone', {
        container: new Container({
            args: [
                'clone',
                '--depth',
                '1',
                '--branch',
                '{{inputs.parameters.branch}}',
                '--single-branch',
                '{{inputs.parameters.repo}}',
                '.',
            ],
            image: 'alpine/git:v2.26.2',
            volumeMounts: [
                {
                    mountPath: '/work',
                    name: 'work',
                },
            ],
            workingDir: '/work',
        }),
        inputs: new Inputs({
            parameters: [repoInputParameter, branchInputParameter],
        }),
    });

    const pathInputParameter = new InputParameter('path');

    const buildTemplate = new Template('build', {
        container: new Container({
            args: ['build', '-v', '-o', 'argosay', './...'],
            command: ['go'],
            env: [
                new EnvironmentVariable('GO111MODULE', {
                    value: 'off',
                }),
            ],
            image: 'golang:1.13',
            volumeMounts: [
                {
                    mountPath: '/work',
                    name: 'work',
                },
            ],
            workingDir: '/work/{{inputs.parameters.path}}',
        }),
        inputs: new Inputs({
            parameters: [pathInputParameter],
        }),
    });

    const imageInputParameter = new InputParameter('image');

    const imageTemplate = new Template('image', {
        container: new Container({
            args: [
                'build',
                '--frontend',
                'dockerfile.v0',
                '--local',
                'context=.',
                '--local',
                'dockerfile=.',
                '--output',
                'type=image,name=docker.io/{{inputs.parameters.image}},push=true',
            ],
            command: ['buildctl-daemonless.sh'],
            env: [
                new EnvironmentVariable('BUILDKITD_FLAGS', {
                    value: '--oci-worker-no-process-sandbox',
                }),
                new EnvironmentVariable('DOCKER_CONFIG', {
                    value: '/.docker',
                }),
            ],
            image: 'moby/buildkit:v0.9.3-rootless',
            readinessProbe: {
                exec: {
                    command: ['sh', '-c', 'buildctl debug workers'],
                },
            },
            volumeMounts: [
                {
                    mountPath: '/work',
                    name: 'work',
                },
                {
                    mountPath: '/.docker',
                    name: 'docker-config',
                },
            ],
            workingDir: '/work/{{inputs.parameters.path}}',
        }),
        inputs: new Inputs({
            parameters: [pathInputParameter, imageInputParameter],
        }),
        volumes: [
            {
                name: 'docker-config',
                secret: {
                    secretName: 'docker-config',
                },
            },
        ],
    });

    const cloneTask = new DagTask('clone', {
        arguments: new Arguments({
            parameters: [
                repoInputParameter.toArgumentParameter({ value: '{{workflow.parameters.repo}}' }),
                branchInputParameter.toArgumentParameter({ value: '{{workflow.parameters.branch}}' }),
            ],
        }),
        template: cloneTemplate,
    });

    const buildTask = new DagTask('build', {
        arguments: new Arguments({
            parameters: [pathInputParameter.toArgumentParameter({ value: '{{workflow.parameters.path}}' })],
        }),
        depends: cloneTask,
        template: buildTemplate,
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [
                cloneTask,
                buildTask,
                new DagTask('image', {
                    arguments: new Arguments({
                        parameters: [
                            pathInputParameter.toArgumentParameter({ value: '{{workflow.parameters.path}}' }),
                            imageInputParameter.toArgumentParameter({ value: '{{workflow.parameters.image}}' }),
                        ],
                    }),
                    depends: buildTask,
                    template: imageTemplate,
                }),
            ],
        }),
    });

    return new WorkflowTemplate({
        metadata: {
            name: 'buildkit',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('repo', { value: 'https://github.com/argoproj/argo-workflows' }),
                    new WorkflowParameter('branch', { value: 'master' }),
                    new WorkflowParameter('path', { value: 'test/e2e/images/argosay/v2' }),
                    new WorkflowParameter('image', { value: 'alexcollinsintuit/argosay:v2' }),
                ],
            }),
            entrypoint: mainTemplate,
            volumeClaimTemplates: [
                {
                    metadata: {
                        name: 'work',
                    },
                    spec: {
                        accessModes: ['ReadWriteOnce'],
                        resources: {
                            requests: {
                                storage: '64Mi',
                            },
                        },
                    },
                },
            ],
        }),
    }).toWorkflowTemplate();
}
