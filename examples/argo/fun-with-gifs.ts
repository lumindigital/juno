import { OutputArtifact } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { Outputs } from '../../src/api/outputs';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const createOutputDirTemplate = new Template('create-output-dir', {
        container: new Container({
            command: ['mkdir', '/mnt/data/output'],
            image: 'alpine:3.6',
            volumeMounts: [
                {
                    mountPath: '/mnt/data',
                    name: 'workdir',
                },
            ],
        }),
    });

    const downloadImagesTemplate = new Template('download-images', {
        container: new Container({
            command: [
                'aws',
                '--no-sign-request',
                's3',
                'cp',
                '--recursive',
                's3://ax-public/cricket_gif_images',
                '/mnt/data/',
            ],
            image: 'mesosphere/aws-cli',
            volumeMounts: [
                {
                    mountPath: '/mnt/data',
                    name: 'workdir',
                },
            ],
        }),
    });

    const createGifTemplate = new Template('create-gif', {
        container: new Container({
            command: ['convert', '-delay', '20', '-loop', '0', '/mnt/data/*.gif', '/mnt/data/output/orig.gif'],
            image: 'v4tech/imagemagick',
            volumeMounts: [
                {
                    mountPath: '/mnt/data',
                    name: 'workdir',
                },
            ],
        }),
    });

    const blackAndWhiteTemplate = new Template('black-and-white', {
        container: new Container({
            command: [
                'convert',
                '/mnt/data/output/orig.gif',
                '-colorspace',
                'Gray',
                '/mnt/data/output/black_white.gif',
            ],
            image: 'v4tech/imagemagick',
            volumeMounts: [
                {
                    mountPath: '/mnt/data',
                    name: 'workdir',
                },
            ],
        }),
    });

    const combineHorizontalTemplate = new Template('combine-horizontal', {
        container: new Container({
            command: ['convert', '+append', '/mnt/data/*.gif', '/mnt/data/output/horizontal.gif'],
            image: 'v4tech/imagemagick',
            volumeMounts: [
                {
                    mountPath: '/mnt/data',
                    name: 'workdir',
                },
            ],
        }),
    });

    const combineVerticalTemplate = new Template('combine-vertical', {
        container: new Container({
            command: ['convert', '-append', '/mnt/data/*.gif', '/mnt/data/output/vertical.gif'],
            image: 'v4tech/imagemagick',
            volumeMounts: [
                {
                    mountPath: '/mnt/data',
                    name: 'workdir',
                },
            ],
        }),
    });

    const makeBiggerTemplate = new Template('make-bigger', {
        container: new Container({
            command: [
                'gifsicle',
                '/mnt/data/output/orig.gif',
                '--resize',
                '1000x800',
                '-o',
                '/mnt/data/output/orig_big.gif',
            ],
            image: 'starefossen/gifsicle',
            volumeMounts: [
                {
                    mountPath: '/mnt/data',
                    name: 'workdir',
                },
            ],
        }),
    });

    const bundleUpTemplate = new Template('bundle-up', {
        container: new Container({
            command: ['ls'],
            image: 'alpine:3.6',
            volumeMounts: [
                {
                    mountPath: '/mnt/data',
                    name: 'workdir',
                },
            ],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('output-gif', {
                    path: '/mnt/data/output',
                }),
            ],
        }),
    });

    const runWorkflowTemplate = new Template('run-workflow', {
        steps: [
            [
                new WorkflowStep('step-1', {
                    template: createOutputDirTemplate,
                }),
            ],
            [
                new WorkflowStep('step-2', {
                    template: downloadImagesTemplate,
                }),
            ],
            [
                new WorkflowStep('step-3', {
                    template: createGifTemplate,
                }),
            ],
            [
                new WorkflowStep('step-4', {
                    template: blackAndWhiteTemplate,
                }),
            ],
            [
                new WorkflowStep('step-5', {
                    template: combineHorizontalTemplate,
                }),
            ],
            [
                new WorkflowStep('step-6', {
                    template: combineVerticalTemplate,
                }),
            ],
            [
                new WorkflowStep('step-7', {
                    template: makeBiggerTemplate,
                }),
            ],
            [
                new WorkflowStep('step-8', {
                    template: bundleUpTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'fun-with-gifs-',
        },
        spec: new WorkflowSpec({
            entrypoint: runWorkflowTemplate,
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
