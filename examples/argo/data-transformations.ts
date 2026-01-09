import { Arguments } from '../../src/api/arguments';
import { InputArtifact, OutputArtifact, OutputResult } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { Outputs } from '../../src/api/outputs';
import { FromItemProperty, InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const listLogFilesTemplate = new Template('list-log-files', {
        data: {
            source: {
                artifactPaths: {
                    name: 'test-bucket',
                    s3: {
                        bucket: 'my-bucket',
                    },
                },
            },
            transformation: [
                {
                    expression: 'filter(data, {# endsWith "main.log"})',
                },
            ],
        },
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('file', {
                    path: '/file',
                }),
            ],
        }),
    });

    const fileNameInputParameter = new InputParameter('file-name');
    const fileInputArtifact = new InputArtifact('file', {
        path: '/file',
    });

    const processLogsTemplate = new Template('process-logs', {
        container: new Container({
            args: [`echo ${simpleTag(fileNameInputParameter)}\nhead /file\n`],
            command: ['sh', '-c'],
            image: 'argoproj/argosay:v2',
        }),
        inputs: new Inputs({
            artifacts: [fileInputArtifact],
            parameters: [fileNameInputParameter],
        }),
    });

    const listLogFilesStep = new WorkflowStep('list-log-files', {
        template: listLogFilesTemplate,
    });

    const dataTransformationsTemplate = new Template('data-transformations', {
        steps: [
            [listLogFilesStep],
            [
                new WorkflowStep('process-logs', {
                    arguments: new Arguments({
                        artifacts: [
                            fileInputArtifact.toArgumentArtifact({
                                s3: {
                                    key: simpleTag(new FromItemProperty()).toString(),
                                },
                            }),
                        ],
                        parameters: [
                            fileNameInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    template: processLogsTemplate,
                    withParamExpression: { workflowStep: listLogFilesStep, output: new OutputResult() },
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This workflow demonstrates using a data template to list in an S3 bucket\nand then process those log files.\n',
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'data-transformations-',
        },
        spec: new WorkflowSpec({
            entrypoint: dataTransformationsTemplate,
        }),
    }).toWorkflow();
}
