import { Arguments } from '../../src/api/arguments';
import { OutputResult } from '../../src/api/artifact';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { FromItemProperty, InputParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const numInputParameter = new InputParameter('num');

    const oddOrEvenTemplate = new Template('odd-or-even', {
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import json
i = ${simpleTag(numInputParameter)}
res = {
  "num": i,
  "evenness": "even" if i % 2 == 0 else "odd"
}
print(json.dumps(res))
`,
        }),
    });

    const divideBy2Template = new Template('divide-by-2', {
        inputs: new Inputs({
            parameters: [numInputParameter],
        }),
        script: new Script({
            command: ['sh', '-x'],
            image: 'alpine:latest',
            source: `echo $((${simpleTag(numInputParameter)}/2))\n`,
        }),
    });

    const oddOrEvenStep = new WorkflowStep('odd-or-even', {
        arguments: new Arguments({
            parameters: [numInputParameter.toArgumentParameter({ valueFromExpressionArgs: new FromItemProperty() })],
        }),
        template: oddOrEvenTemplate,
        withItems: [1, 2, 3, 4],
    });

    const parameterAggregationTemplate = new Template('parameter-aggregation', {
        steps: [
            [oddOrEvenStep],
            [
                new WorkflowStep('divide-by-2', {
                    arguments: new Arguments({
                        parameters: [
                            numInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: new FromItemProperty('num'),
                            }),
                        ],
                    }),
                    template: divideBy2Template,
                    when: `${simpleTag(new FromItemProperty('evenness'))} == even`,
                    withParamExpression: { workflowStep: oddOrEvenStep, output: new OutputResult() },
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'parameter-aggregation-script-',
        },
        spec: new WorkflowSpec({
            entrypoint: parameterAggregationTemplate,
        }),
    }).toWorkflow();
}
