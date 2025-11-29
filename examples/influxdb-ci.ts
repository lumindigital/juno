import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const repoWorkflowParameter = new WorkflowParameter('repo', {
        value: 'https://github.com/influxdata/influxdb.git',
    });
    const revisionWorkflowParameter = new WorkflowParameter('revision', { value: '1.6' });

    const sourceOutputArtifact = new OutputArtifact('source', {
        path: '/src',
    });

    const influxdOutputArtifact = new OutputArtifact('influxd', {
        path: '/go/bin',
    });

    const checkoutTemplate = new Template('checkout', {
        container: new Container({
            args: ['cd /src && git status && ls -l'],
            command: ['/bin/sh', '-c'],
            image: 'golang:1.9.2',
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('source', {
                    git: {
                        repo: simpleTag(repoWorkflowParameter),
                        revision: simpleTag(revisionWorkflowParameter),
                    },
                    path: '/src',
                }),
            ],
        }),
        outputs: new Outputs({
            artifacts: [sourceOutputArtifact],
        }),
    });

    const sourceInputArtifact = new InputArtifact('source', {
        path: '/go/src/github.com/influxdata/influxdb',
    });

    const buildTemplate = new Template('build', {
        container: new Container({
            args: [
                'cd /go/src/github.com/influxdata/influxdb && go get github.com/golang/dep/cmd/dep && dep ensure -vendor-only && go install -v ./...',
            ],
            command: ['/bin/sh', '-c'],
            image: 'golang:1.9.2',
            resources: {
                requests: {
                    cpu: '200m',
                    memory: '1024Mi',
                },
            },
        }),
        inputs: new Inputs({
            artifacts: [sourceInputArtifact],
        }),
        outputs: new Outputs({
            artifacts: [influxdOutputArtifact],
        }),
    });

    const testUnitTemplate = new Template('test-unit', {
        container: new Container({
            args: [
                'cd /go/src/github.com/influxdata/influxdb && go get github.com/golang/dep/cmd/dep && dep ensure -vendor-only && go test -parallel=1 ./...',
            ],
            command: ['/bin/sh', '-c'],
            image: 'golang:1.9.2',
        }),
        inputs: new Inputs({
            artifacts: [sourceInputArtifact],
        }),
    });

    const packageInputParameter = new InputParameter('package');

    const testCovBaseTemplate = new Template('test-cov-base', {
        container: new Container({
            args: [
                `cd /go/src/github.com/influxdata/influxdb && go get github.com/golang/dep/cmd/dep && dep ensure -vendor-only && go test -v -coverprofile /tmp/cov.out ./${simpleTag(packageInputParameter)} && go tool cover -html=/tmp/cov.out -o /tmp/index.html`,
            ],
            command: ['/bin/sh', '-c'],
            image: 'golang:1.9.2',
            resources: {
                requests: {
                    cpu: '200m',
                    memory: '4096Mi',
                },
            },
        }),
        inputs: new Inputs({
            artifacts: [sourceInputArtifact],
            parameters: [packageInputParameter],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('covreport', {
                    path: '/tmp/index.html',
                }),
            ],
        }),
    });

    const testCovSourceInputArtifact = new InputArtifact('source');

    const testCovTemplate = new Template('test-cov', {
        inputs: new Inputs({
            artifacts: [testCovSourceInputArtifact],
        }),
        steps: [
            [
                new WorkflowStep('test-cov-query', {
                    arguments: new Arguments({
                        artifacts: [
                            testCovSourceInputArtifact.toArgumentArtifact({
                                from: simpleTag(testCovSourceInputArtifact),
                            }),
                        ],
                        parameters: [packageInputParameter.toArgumentParameter({ value: 'query' })],
                    }),
                    template: testCovBaseTemplate,
                }),
                new WorkflowStep('test-cov-tsm1', {
                    arguments: new Arguments({
                        artifacts: [
                            testCovSourceInputArtifact.toArgumentArtifact({
                                from: simpleTag(testCovSourceInputArtifact),
                            }),
                        ],
                        parameters: [packageInputParameter.toArgumentParameter({ value: 'tsdb/engine/tsm1' })],
                    }),
                    template: testCovBaseTemplate,
                }),
            ],
        ],
    });

    const cmdInputParameter = new InputParameter('cmd');

    const influxdbClientTemplate = new Template('influxdb-client', {
        container: new Container({
            args: [simpleTag(cmdInputParameter)],
            command: ['/bin/sh', '-c'],
            image: 'appropriate/curl:latest',
            resources: {
                requests: {
                    cpu: '100m',
                    memory: '32Mi',
                },
            },
        }),
        inputs: new Inputs({
            parameters: [cmdInputParameter],
        }),
    });

    const influxdInputArtifact = new InputArtifact('influxd', {
        path: '/app',
    });

    const influxdbServerTemplate = new Template('influxdb-server', {
        container: new Container({
            args: ['chmod +x /app/influxd && /app/influxd'],
            command: ['/bin/sh', '-c'],
            image: 'debian:9.4',
            readinessProbe: {
                httpGet: {
                    path: '/ping',
                    port: '8086',
                },
                initialDelaySeconds: 5,
                timeoutSeconds: 1,
            },
            resources: {
                requests: {
                    cpu: '250m',
                    memory: '512Mi',
                },
            },
        }),
        daemon: true,
        inputs: new Inputs({
            artifacts: [influxdInputArtifact],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('data', {
                    path: '/var/lib/influxdb/data',
                }),
            ],
        }),
    });

    const influxDbWorkflowStep = new WorkflowStep('influxdb-server', {
        arguments: new Arguments({
            artifacts: [influxdInputArtifact.toArgumentArtifact({ from: simpleTag(influxdInputArtifact) })],
        }),
        template: influxdbServerTemplate,
    });

    const testE2eTemplate = new Template('test-e2e', {
        inputs: new Inputs({
            artifacts: [new InputArtifact('influxd', {})],
        }),
        steps: [
            [influxDbWorkflowStep],
            [
                new WorkflowStep('initdb', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `curl -XPOST 'http://${simpleTag({ workflowStep: influxDbWorkflowStep, output: 'ip' })}:8086/query' --data-urlencode "q=CREATE DATABASE mydb"`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
            ],
            [
                new WorkflowStep('producer1', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `for i in $(seq 1 20); do curl -XPOST 'http://${simpleTag({ workflowStep: influxDbWorkflowStep, output: 'ip' })}:8086/write?db=mydb' -d "cpu,host=server01,region=uswest load=$i" ; sleep .5 ; done`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
                new WorkflowStep('producer2', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `for i in $(seq 1 20); do curl -XPOST 'http://${simpleTag({ workflowStep: influxDbWorkflowStep, output: 'ip' })}:8086/write?db=mydb' -d "cpu,host=server02,region=uswest load=$((RANDOM % 100))" ; sleep .5 ; done`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
                new WorkflowStep('producer3', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `curl -XPOST 'http://${simpleTag({ workflowStep: influxDbWorkflowStep, output: 'ip' })}:8086/write?db=mydb' -d 'cpu,host=server03,region=useast load=15.4'`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
                new WorkflowStep('consumer', {
                    arguments: new Arguments({
                        parameters: [
                            cmdInputParameter.toArgumentParameter({
                                value: `curl --silent -G http://${simpleTag({ workflowStep: influxDbWorkflowStep, output: 'ip' })}:8086/query?pretty=true --data-urlencode "db=mydb" --data-urlencode "q=SELECT * FROM cpu"`,
                            }),
                        ],
                    }),
                    template: influxdbClientTemplate,
                }),
            ],
        ],
    });

    const checkoutStep = new WorkflowStep('checkout', {
        template: checkoutTemplate,
    });

    const buildStep = new WorkflowStep('build', {
        arguments: new Arguments({
            artifacts: [
                sourceInputArtifact.toArgumentArtifact({
                    from: simpleTag({ workflowStep: checkoutStep, output: sourceOutputArtifact }),
                }),
            ],
        }),
        template: buildTemplate,
    });

    const influxdbCiTemplate = new Template('influxdb-ci', {
        steps: [
            [checkoutStep],
            [
                buildStep,
                new WorkflowStep('test-unit', {
                    arguments: new Arguments({
                        artifacts: [
                            sourceInputArtifact.toArgumentArtifact({
                                from: simpleTag({ workflowStep: checkoutStep, output: sourceOutputArtifact }),
                            }),
                        ],
                    }),
                    template: testUnitTemplate,
                }),
            ],
            [
                new WorkflowStep('test-cov', {
                    arguments: new Arguments({
                        artifacts: [
                            testCovSourceInputArtifact.toArgumentArtifact({
                                from: simpleTag({ workflowStep: checkoutStep, output: sourceOutputArtifact }),
                            }),
                        ],
                    }),
                    template: testCovTemplate,
                }),
                new WorkflowStep('test-e2e', {
                    arguments: new Arguments({
                        artifacts: [
                            influxdInputArtifact.toArgumentArtifact({
                                valueFromExpressionArgs: { workflowStep: buildStep, output: influxdOutputArtifact },
                            }),
                        ],
                    }),
                    template: testE2eTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'influxdb-ci-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [repoWorkflowParameter, revisionWorkflowParameter],
            }),
            entrypoint: influxdbCiTemplate,
        }),
    }).toWorkflow();
}
