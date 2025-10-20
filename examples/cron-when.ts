import { IoArgoprojWorkflowV1Alpha1CronWorkflow } from '../src/workflow-interfaces/data-contracts';
import { CronWorkflow } from '../src/api/cron-workflow';
import { CronWorkflowSpec } from '../src/api/cron-workflow-spec';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { Template } from '../src/api/template';
import { Container } from '../src/api/container';
import { expressionTag } from '../src/api/expression';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1CronWorkflow> {
    const sleepBusyBox = new Template('sleep-busybox', {
        container: new Container({
            image: 'busybox',
            command: ['sleep'],
            args: ['10'],
        }),
    });

    return new CronWorkflow({
        metadata: {
            name: 'sleep-when',
        },
        spec: new CronWorkflowSpec({
            schedule: '* * * * *',
            concurrencyPolicy: 'Allow',
            when: expressionTag(
                'cronworkflow.lastScheduledTime == nil || (now() - cronworkflow.lastScheduledTime).Seconds() > 360',
            ),
            workflowSpec: new WorkflowSpec({
                entrypoint: sleepBusyBox,
            }),
        }),
    }).toCronWorkflowTemplate();
}
