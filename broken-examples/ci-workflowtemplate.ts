import { WorkflowArguments } from '../src/api/arguments';
import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowTemplate } from '../src/api/workflow-template';
import { IoArgoprojWorkflowV1Alpha1WorkflowTemplate } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1WorkflowTemplate> {
    const cacheRestoreTemplate = new Template('cache-restore', {
        container: new Container({
            args: [
                'mkdir -p $(go env GOMODCACHE)\n[ -e /mnt/GOMODCACHE ] && cp -Rf /mnt/GOMODCACHE $(go env GOMODCACHE)\nmkdir -p $(go env GOCACHE)\n[ -e /mnt/GOCACHE ] &&  cp -Rf /mnt/GOCACHE $(go env GOCACHE)\n',
            ],
            command: ['sh', '-euxc'],
            image: 'golang:1.18',
            volumeMounts: [
                {
                    mountPath: '/go/pkg/mod',
                    name: 'work',
                    subPath: 'mod',
                },
                {
                    mountPath: '/root/.cache/go-build',
                    name: 'work',
                    subPath: 'cache',
                },
            ],
            workingDir: '/go/src/github.com/golang/example',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('GOMODCACHE', {
                    optional: true,
                    path: '/mnt/GOMODCACHE',
                    s3: {
                        key: 'github.com/golang/examples/{{workflow.parameters.branch}}/GOMODCACHE',
                    },
                }),
                new InputArtifact('GOCACHE', {
                    optional: true,
                    path: '/mnt/GOCACHE',
                    s3: {
                        key: 'github.com/golang/examples/{{workflow.parameters.branch}}/GOCACHE',
                    },
                }),
            ],
        }),
    });

    const cacheStoreTemplate = new Template('cache-store', {
        container: new Container({
            image: 'golang:1.18',
            volumeMounts: [
                {
                    mountPath: '/go/pkg/mod',
                    name: 'work',
                    subPath: 'GOMODCACHE',
                },
                {
                    mountPath: '/root/.cache/go-build',
                    name: 'work',
                    subPath: 'GOCACHE',
                },
            ],
            workingDir: '/go/src/github.com/golang/example',
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('GOMODCACHE', {
                    optional: true,
                    path: '/go/pkg/mod',
                    s3: {
                        key: 'github.com/golang/examples/{{workflow.parameters.branch}}/GOMODCACHE',
                    },
                }),
                new OutputArtifact('GOCACHE', {
                    optional: true,
                    path: '/root/.cache/go-build',
                    s3: {
                        key: 'github.com/golang/examples/{{workflow.parameters.branch}}/GOCACHE',
                    },
                }),
            ],
        }),
    });

    const cloneTemplate = new Template('clone', {
        container: new Container({
            args: [
                'git clone -v -b "{{workflow.parameters.branch}}" --single-branch --depth 1 https://github.com/golang/example.git .\n',
            ],
            command: ['sh', '-euxc'],
            image: 'golang:1.18',
            volumeMounts: [
                {
                    mountPath: '/go/src/github.com/golang/example',
                    name: 'work',
                    subPath: 'src',
                },
                {
                    mountPath: '/go/pkg/mod',
                    name: 'work',
                    subPath: 'GOMODCACHE',
                },
                {
                    mountPath: '/root/.cache/go-build',
                    name: 'work',
                    subPath: 'GOCACHE',
                },
            ],
            workingDir: '/go/src/github.com/golang/example',
        }),
    });

    const depsTemplate = new Template('deps', {
        container: new Container({
            args: ['go mod download -x\n'],
            command: ['sh', '-xuce'],
            image: 'golang:1.18',
            volumeMounts: [
                {
                    mountPath: '/go/src/github.com/golang/example',
                    name: 'work',
                    subPath: 'src',
                },
                {
                    mountPath: '/go/pkg/mod',
                    name: 'work',
                    subPath: 'GOMODCACHE',
                },
                {
                    mountPath: '/root/.cache/go-build',
                    name: 'work',
                    subPath: 'GOCACHE',
                },
            ],
            workingDir: '/go/src/github.com/golang/example',
        }),
    });

    const buildTemplate = new Template('build', {
        container: new Container({
            args: ['go build ./...\n'],
            command: ['sh', '-xuce'],
            image: 'golang:1.18',
            volumeMounts: [
                {
                    mountPath: '/go/src/github.com/golang/example',
                    name: 'work',
                    subPath: 'src',
                },
                {
                    mountPath: '/go/pkg/mod',
                    name: 'work',
                    subPath: 'GOMODCACHE',
                },
                {
                    mountPath: '/root/.cache/go-build',
                    name: 'work',
                    subPath: 'GOCACHE',
                },
            ],
            workingDir: '/go/src/github.com/golang/example',
        }),
    });

    const testTemplate = new Template('test', {
        container: new Container({
            args: [
                "go install github.com/jstemmer/go-junit-report@latest\ngo install github.com/alexec/junit2html@v0.0.2\n\ntrap 'cat test.out | go-junit-report | junit2html > test-report.html' EXIT\n\ngo test -v ./... 2>&1 > test.out\n",
            ],
            command: ['sh', '-euxc'],
            image: 'golang:1.18',
            volumeMounts: [
                {
                    mountPath: '/go/src/github.com/golang/example',
                    name: 'work',
                    subPath: 'src',
                },
                {
                    mountPath: '/go/pkg/mod',
                    name: 'work',
                    subPath: 'GOMODCACHE',
                },
                {
                    mountPath: '/root/.cache/go-build',
                    name: 'work',
                    subPath: 'GOCACHE',
                },
            ],
            workingDir: '/go/src/github.com/golang/example',
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('test-report', {
                    archive: {
                        none: {},
                    },
                    path: '/go/src/github.com/golang/example/test-report.html',
                    s3: {
                        key: '{{workflow.parameters.branch}}/test-report.html',
                    },
                }),
            ],
        }),
    });

    const cacheRestoreTask = new DagTask('cache-restore', {
        template: cacheRestoreTemplate,
    });

    const cloneTask = new DagTask('clone', {
        template: cloneTemplate,
    });

    const depsTask = new DagTask('deps', {
        dependencies: [cacheRestoreTask, cloneTask],
        template: depsTemplate,
    });

    const buildTask = new DagTask('build', {
        dependencies: [depsTask],
        template: buildTemplate,
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [
                cacheRestoreTask,
                cloneTask,
                depsTask,
                buildTask,
                new DagTask('test', {
                    dependencies: [buildTask],
                    template: testTemplate,
                }),
            ],
        }),
    });

    return new WorkflowTemplate({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This workflows builds and tests Argo Workflows.\n\nIt demonstrates:\n\n* Cache restore and store.\n* Publishing test reports.\n',
            },
            name: 'ci',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [new WorkflowParameter('branch', { value: 'master' })],
            }),
            entrypoint: mainTemplate,
            onExit: cacheStoreTemplate,
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
