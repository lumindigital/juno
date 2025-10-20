import { Arguments } from '../src/api/arguments';
import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const loadMarkersTemplate = new Template('load-markers', {
        container: new Container({
            command: ['mkdir', '-p', '/work/markers'],
            image: 'busybox',
            volumeMounts: [
                {
                    mountPath: '/work',
                    name: 'work',
                },
            ],
        }),
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('markers', {
                    optional: true,
                    path: '/work/markers',
                    s3: {
                        accessKeySecret: {
                            key: 'accesskey',
                            name: 'my-minio-cred',
                        },
                        bucket: 'my-bucket',
                        endpoint: 'minio:9000',
                        insecure: true,
                        key: 'work-avoidance-markers',
                        secretKeySecret: {
                            key: 'secretkey',
                            name: 'my-minio-cred',
                        },
                    },
                }),
            ],
        }),
    });

    const numInputParameter = new InputParameter('num');

    const echoTemplate = new Template('echo', {
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
        script: new Script({
            command: ['sh', '-eux'],
            image: 'busybox',
            source: `marker=/work/markers/$(date +%Y-%m-%d)-echo-{{inputs.parameters.num}}
if [ -e  \${marker} ]; then
  echo "work already done"
  exit 0
fi
echo "working very hard"
# toss a virtual coin and exit 1 if 1
if [ $(($(($RANDOM%10))%2)) -eq 1 ]; then
  echo "oh no!"
  exit 1
fi
touch \${marker}
`,
            volumeMounts: [
                {
                    mountPath: '/work',
                    name: 'work',
                },
            ],
        }),
    });

    const saveMarkersTemplate = new Template('save-markers', {
        container: new Container({
            command: ['true'],
            image: 'busybox',
            volumeMounts: [
                {
                    mountPath: '/work',
                    name: 'work',
                },
            ],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('markers', {
                    path: '/work/markers',
                    s3: {
                        accessKeySecret: {
                            key: 'accesskey',
                            name: 'my-minio-cred',
                        },
                        bucket: 'my-bucket',
                        endpoint: 'minio:9000',
                        insecure: true,
                        key: 'work-avoidance-markers',
                        secretKeySecret: {
                            key: 'secretkey',
                            name: 'my-minio-cred',
                        },
                    },
                }),
            ],
        }),
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('load-markers', {
                    template: loadMarkersTemplate,
                }),
            ],
            [
                new WorkflowStep('echo', {
                    arguments: new Arguments({
                        parameters: [numInputParameter.toArgumentParameter({ value: '{{item}}' })],
                    }),
                    template: echoTemplate,
                    withSequence: {
                        count: '3',
                    },
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'work-avoidance-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
            onExit: saveMarkersTemplate,
            volumeClaimTemplates: [
                {
                    metadata: {
                        name: 'work',
                    },
                    spec: {
                        accessModes: ['ReadWriteOnce'],
                        resources: {
                            requests: {
                                storage: '10Mi',
                            },
                        },
                    },
                },
            ],
        }),
    }).toWorkflow();
}
