import { WorkflowArguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { equals } from '../../src/api/expressions/comparison';
import { expressionTag, hyphenateExpressionArgs, simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { jsonPath, WorkflowParametersJson } from '../../src/api/expressions/json-path';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const shouldPrintInputParameter = new InputParameter('should-print');
    const shouldPrintWorkflowParameter = shouldPrintInputParameter.toWorkflowParameter({
        value: 'true',
    });

    const argosayTemplate = new Template('argosay', {
        container: new Container({
            args: ['cowsay hello'],
            command: ['sh', '-c'],
            image: 'argoproj/argosay:v1',
        }),
    });

    const conditionalExampleTemplate = new Template('conditional-example', {
        inputs: new Inputs({
            parameters: [shouldPrintInputParameter],
        }),
        steps: [
            [
                new WorkflowStep('print-hello-govaluate', {
                    template: argosayTemplate,
                    whenExpression: equals(simpleTag(shouldPrintInputParameter), 'true'),
                }),
                new WorkflowStep('print-hello-expr', {
                    template: argosayTemplate,
                    whenExpression: expressionTag(equals(hyphenateExpressionArgs(shouldPrintInputParameter), true)),
                }),
                new WorkflowStep('print-hello-expr-json', {
                    template: argosayTemplate,
                    whenExpression: expressionTag(equals(jsonPath(new WorkflowParametersJson(), '$[0].value'), 'true')),
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'conditional-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [shouldPrintWorkflowParameter],
            }),
            entrypoint: conditionalExampleTemplate,
        }),
    }).toWorkflow();
}
