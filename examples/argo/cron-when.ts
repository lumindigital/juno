import { IoArgoprojWorkflowV1Alpha1CronWorkflow } from '../../src/workflow-interfaces/data-contracts';
import { CronWorkflow } from '../../src/api/cron-workflow';
import { CronWorkflowSpec } from '../../src/api/cron-workflow-spec';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { Template } from '../../src/api/template';
import { Container } from '../../src/api/container';
import { equals, greaterThan } from '../../src/api/expressions/comparison';
import { expressionTag } from '../../src/api/expressions/tag';
import { or } from '../../src/api/expressions/logical';
import { NilResult } from '../../src/api/expressions/classes';

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
                or([
                    equals({ string: 'cronworkflow.lastScheduledTime' }, new NilResult()),
                    greaterThan({ string: '(now() - cronworkflow.lastScheduledTime).Seconds()' }, 360),
                ]),
            ).toString(),
            workflowSpec: new WorkflowSpec({
                entrypoint: sleepBusyBox,
            }),
        }),
    }).toCronWorkflowTemplate();
}
