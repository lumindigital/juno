import { Container } from '../src/api/container';
import { CronWorkflow } from '../src/api/cron-workflow';
import { CronWorkflowSpec } from '../src/api/cron-workflow-spec';
import { Template } from '../src/api/template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowTemplate } from '../src/api/workflow-template';
import { WorkflowTemplateReference } from '../src/api/workflow-template-reference';
import { IoArgoprojWorkflowV1Alpha1CronWorkflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1CronWorkflow> {
    const helloWorldTemplate = new Template('hello-world', {
        archiveLocation: {
            archiveLogs: true,
        },
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    const workflowTemplate = new WorkflowTemplate({
        metadata: {
            name: 'dag-inline',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
        }),
    });

    return new CronWorkflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This example demonstrates running cron workflow that has a DAG with inline templates.\n',
                'workflows.argoproj.io/version': '>= 3.2.0',
            },
            name: 'dag-inline',
        },
        spec: new CronWorkflowSpec({
            schedule: '*/5 * * * *',
            workflowSpec: new WorkflowSpec({
                workflowTemplateRef: new WorkflowTemplateReference({
                    workflowTemplate: workflowTemplate,
                }),
            }),
        }),
    }).toCronWorkflowTemplate();
}
