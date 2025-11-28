import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { ContainerNode } from '../src/api/container-node';
import { ContainerSetTemplate } from '../src/api/container-set-template';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { Template } from '../src/api/template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowTemplate } from '../src/api/workflow-template';
import { IoArgoprojWorkflowV1Alpha1WorkflowTemplate } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1WorkflowTemplate> {
    const setupNode = new ContainerNode('setup', {
        args: ['mkdir -p /out/assets\n'],
        command: ['sh', '-c'],
        image: 'argoproj/argosay:v2',
    });
    const gnuplotNode = new ContainerNode('gnuplot', {
        args: [
            '-e',
            "set xlabel 'Year'; set ylabel 'Mean';\nset grid;\nset datafile separator ',';\nset term png size 600,400;\nset output '/out/assets/global-temp.png';\nplot '/in/annual.csv' every 2::0 skip 1 using 2:3 title 'Global Temperature' with lines linewidth 2;\n",
        ],
        dependencies: [setupNode], //This should use the name of a container set
        image: 'remuslazar/gnuplot',
        name: 'gnuplot',
    });
    const mainNode = new ContainerNode('main', {
        args: [
            "cowsay \"hello world\" > /out/hello.txt\n\ncat > /out/hello.json <<EOF\n{\"hello\": {\"world\": true}}\nEOF\n\necho '* {font-family: sans-serif}' > /out/assets/styles.css\n\ncat > /out/index.html <<EOF\n<html>\n  <head>\n    <link rel='stylesheet' href='assets/styles.css' type='text/css'/>\n  </head>\n  <body>\n    <h1>Global Temperature</h1>\n    <img src='assets/global-temp.png'/>\n  </body>\n</html>\nEOF\n\ncat > /out/malicious.html <<EOF\n<html>\n  <body>\n    <script>alert(1)</script>\n    <p>This page attempts to run a script that shows an alert, but the Argo Server UI Content-Security-Policy will prevent that.</p>\n    <p>To check, open your Web Console and see that \"Blocked script execution ... because the document's frame is sandboxed.\" (or similar) is printed.</p>\n  </body>\n</html>\nEOF\n",
        ],
        command: ['sh', '-c'],
        dependencies: [setupNode],
        image: 'argoproj/argosay:v2',
        name: 'main',
    });

    const mainTemplate = new Template('main', {
        containerSet: new ContainerSetTemplate({
            containers: [setupNode, gnuplotNode, mainNode],
            volumeMounts: [
                {
                    mountPath: '/in',
                    name: 'in',
                },
                {
                    mountPath: '/out',
                    name: 'out',
                },
            ],
        }),

        inputs: new Inputs({
            artifacts: [
                new InputArtifact('temps', {
                    http: {
                        url: 'https://datahub.io/core/global-temp/r/annual.csv',
                    },
                    path: '/in/annual.csv',
                }),
            ],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('text-file', {
                    archive: {
                        none: {},
                    },
                    path: '/out/hello.txt',
                    s3: {
                        key: 'hello.txt',
                    },
                }),
                new OutputArtifact('json-file', {
                    archive: {
                        none: {},
                    },
                    path: '/out/hello.json',
                    s3: {
                        key: 'hello.json',
                    },
                }),
                new OutputArtifact('css-file', {
                    archive: {
                        none: {},
                    },
                    path: '/out/assets/styles.css',
                    s3: {
                        key: 'styles.css',
                    },
                }),
                new OutputArtifact('malicious-file', {
                    archive: {
                        none: {},
                    },
                    path: '/out/malicious.html',
                    s3: {
                        key: 'malicious.html',
                    },
                }),
                new OutputArtifact('report', {
                    archive: {
                        none: {},
                    },
                    path: '/out',
                    s3: {
                        key: 'report/',
                    },
                }),
                new OutputArtifact('tgz-file', {
                    path: '/out/hello.txt',
                    s3: {
                        key: 'file.tgz',
                    },
                }),
                new OutputArtifact('tgz-dir', {
                    path: '/out',
                    s3: {
                        key: 'dir.tgz',
                    },
                }),
            ],
        }),
        volumes: [
            {
                emptyDir: {},
                name: 'in',
            },
            {
                emptyDir: {},
                name: 'out',
            },
        ],
    });

    return new WorkflowTemplate({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': 'This example shows how to produce different types of artifact.\n',
            },
            name: 'artifacts',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflowTemplate();
}
