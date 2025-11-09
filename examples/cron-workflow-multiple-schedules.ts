import { Container } from '../src/api/container';
import { CronWorkflow } from '../src/api/cron-workflow';
import { CronWorkflowSpec } from '../src/api/cron-workflow-spec';
import { simpleTag } from '../src/api/expression';
import { Template } from '../src/api/template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1CronWorkflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1CronWorkflow> {
    const whalesayTemplate = new Template('whalesay', {
        container: new Container({
            args: [`🕓 hello world. Scheduled on: ${simpleTag('workflow.scheduledTime')}`],
            command: ['cowsay'],
            image: 'docker/whalesay:latest',
        }),
    });

    return new CronWorkflow({
        metadata: {
            name: 'hello-world-multiple-schedules',
        },
        spec: new CronWorkflowSpec({
            concurrencyPolicy: 'Replace',
            failedJobsHistoryLimit: 4,
            schedules: ['*/3 * * * *', '*/2 * * * *'],
            startingDeadlineSeconds: 0,
            successfulJobsHistoryLimit: 4,
            suspend: false,
            timezone: 'America/Los_Angeles',
            workflowSpec: new WorkflowSpec({
                entrypoint: whalesayTemplate,
            }),
        }),
    }).toCronWorkflowTemplate();
}
