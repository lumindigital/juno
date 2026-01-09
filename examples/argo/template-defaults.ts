import { Container } from '../../src/api/container';
import { Template, TemplateDefaults } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    const retryBackoffTemplate = new Template('retry-backoff', {
        container: new Container({
            args: ['import random; import sys; exit_code = random.choice([0, 1, 1]); sys.exit(exit_code)'],
            command: ['python', '-c'],
            image: 'python:alpine3.6',
        }),
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('retry-backoff', {
                    template: retryBackoffTemplate,
                }),
            ],
            [
                new WorkflowStep('hello-world', {
                    template: helloWorldTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'Template defaults will provide the fixability to configure the defaults values for all templates in workflow.\nIndividual template can be overide default values.\n',
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'template-defaults-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
            templateDefaults: new TemplateDefaults({
                retryStrategy: {
                    limit: '2',
                },
                timeout: '30s',
            }),
        }),
    }).toWorkflow();
}
