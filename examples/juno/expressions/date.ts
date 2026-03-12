import { Arguments, WorkflowArguments } from '../../../src/api/arguments';
import { DagTask } from '../../../src/api/dag-task';
import { DagTemplate } from '../../../src/api/dag-template';
import { date, duration, now, timezone } from '../../../src/api/expressions/date';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../../src/api/expressions/tag';
import { Inputs } from '../../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../../src/api/parameter';
import { Script } from '../../../src/api/script';
import { Template } from '../../../src/api/template';
import { Workflow } from '../../../src/api/workflow';
import { WorkflowSpec } from '../../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const nowParam = new InputParameter('now-param');
    const durationParam = new InputParameter('duration-param');
    const dateParam = new InputParameter('date-param');
    const dateFormatParam = new InputParameter('date-format-param');
    const timezoneParam = new InputParameter('timezone-param');

    const workflowDateStr = new WorkflowParameter('date-str', {
        value: '2024-01-15',
    });

    const workflowTimezone = new WorkflowParameter('tz', {
        value: 'America/New_York',
    });

    const dateTemplate = new Template('date', {
        inputs: new Inputs({
            parameters: [nowParam, durationParam, dateParam, dateFormatParam, timezoneParam],
        }),
        script: new Script({
            command: ['/bin/sh', '-e'],
            source: `if [ "${simpleTag(nowParam)}" != "" ]; then echo "now failed: got '${simpleTag(nowParam)}'"; exit 11; fi
if [ "${simpleTag(durationParam)}" != "" ]; then echo "duration failed: got '${simpleTag(durationParam)}'"; exit 12; fi
if [ "${simpleTag(dateParam)}" != "" ]; then echo "date failed: got '${simpleTag(dateParam)}'"; exit 13; fi
if [ "${simpleTag(dateFormatParam)}" != "" ]; then echo "date-format failed: got '${simpleTag(dateFormatParam)}'"; exit 14; fi
if [ "${simpleTag(timezoneParam)}" != "" ]; then echo "timezone failed: got '${simpleTag(timezoneParam)}'"; exit 15; fi
echo "All date function tests passed"
`,
            image: 'busybox',
        }),
    });

    const entryPointTemplate = new Template('entrypoint', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('date-task', {
                    arguments: new Arguments({
                        parameters: [
                            nowParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(now()),
                            }),
                            durationParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(duration('1h30m')),
                            }),
                            dateParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(date(hyphenateExpressionArgs(workflowDateStr))),
                            }),
                            dateFormatParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    date(
                                        hyphenateExpressionArgs(workflowDateStr),
                                        '2006-01-02',
                                        hyphenateExpressionArgs(workflowTimezone),
                                    ),
                                ),
                            }),
                            timezoneParam.toArgumentParameter({
                                valueFromExpressionTag: expressionTag(
                                    timezone(hyphenateExpressionArgs(workflowTimezone)),
                                ),
                            }),
                        ],
                    }),
                    template: dateTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is an example of the ways date expressions can be used.\n`,
            },
            generateName: 'date-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [workflowDateStr, workflowTimezone],
            }),
            entrypoint: entryPointTemplate,
        }),
    }).toWorkflow();
}
