import { Arguments } from '../../src/api/arguments';
import { OutputResult } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { Outputs } from '../../src/api/outputs';
import { FromItemProperty, InputParameter, OutputParameter } from '../../src/api/parameter';
import { ParameterValueFrom } from '../../src/api/parameter-value-from';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const numInputParameter = new InputParameter('num');

    const numOutputParameter = new OutputParameter('num', {
        valueFrom: new ParameterValueFrom({
            path: '/tmp/num',
        }),
    });
    const evennessOutputParameter = new OutputParameter('evenness', {
        valueFrom: new ParameterValueFrom({
            path: '/tmp/even',
        }),
    });

    const oddOrEvenTemplate = new Template('odd-or-even', {
        container: new Container({
            args: [
                `sleep 1 &&\necho ${simpleTag(numInputParameter)} > /tmp/num &&\nif [ $((${simpleTag(numInputParameter)}%2)) -eq 0 ]; then\n  echo "even" > /tmp/even;\nelse\n  echo "odd" > /tmp/even;\nfi\n`,
            ],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
        outputs: new Outputs({
            parameters: [numOutputParameter, evennessOutputParameter],
        }),
    });

    const divideBy2Template = new Template('divide-by-2', {
        container: new Container({
            args: [`echo $((${simpleTag(numInputParameter)}/2))`],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
    });

    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: [simpleTag(messageInputParameter).toString()],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const oddOrEvenTask = new DagTask('odd-or-even', {
        arguments: new Arguments({
            parameters: [numInputParameter.toArgumentParameter({ valueFromExpressionArgs: new FromItemProperty() })],
        }),
        template: oddOrEvenTemplate,
        withItems: [1, 2, 3, 4],
    });

    const divideBy2Task = new DagTask('divide-by-2', {
        arguments: new Arguments({
            parameters: [
                numInputParameter.toArgumentParameter({ valueFromExpressionArgs: new FromItemProperty('num') }),
            ],
        }),
        dependsExpression: oddOrEvenTask,
        template: divideBy2Template,
        when: `${simpleTag(new FromItemProperty('evenness'))} == even`,
        withParamExpression: { dagTaskOutputParameter: oddOrEvenTask },
    });

    const parameterAggregationTemplate = new Template('parameter-aggregation', {
        dag: new DagTemplate({
            tasks: [
                oddOrEvenTask,
                new DagTask('print-nums', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: { dagTask: oddOrEvenTask, output: numOutputParameter },
                            }),
                        ],
                    }),
                    dependsExpression: oddOrEvenTask,
                    template: printMessageTemplate,
                }),
                new DagTask('print-evenness', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: { dagTask: oddOrEvenTask, output: evennessOutputParameter },
                            }),
                        ],
                    }),
                    dependsExpression: oddOrEvenTask,
                    template: printMessageTemplate,
                }),
                divideBy2Task,
                new DagTask('print', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty(),
                            }),
                        ],
                    }),
                    dependsExpression: divideBy2Task,
                    template: printMessageTemplate,
                    withParamExpression: { dagTask: divideBy2Task, output: new OutputResult() },
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'parameter-aggregation-dag-',
        },
        spec: new WorkflowSpec({
            entrypoint: parameterAggregationTemplate,
        }),
    }).toWorkflow();
}
