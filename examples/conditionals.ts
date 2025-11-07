import { WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { expressionTag, hyphenParameter, simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const shouldPrintInputParameter = new InputParameter('should-print');

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
                    when: `${simpleTag(shouldPrintInputParameter)} == true`,
                }),
                new WorkflowStep('print-hello-expr', {
                    template: argosayTemplate,
                    when: expressionTag(`${hyphenParameter(shouldPrintInputParameter)} == 'true'`),
                }),
                new WorkflowStep('print-hello-expr-json', {
                    template: argosayTemplate,
                    when: expressionTag(`jsonpath(workflow.parameters.json, '$[0].value') == 'true'`),
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
                parameters: [
                    new WorkflowParameter('should-print', {
                        value: 'true',
                    }),
                ],
            }),
            entrypoint: conditionalExampleTemplate,
        }),
    }).toWorkflow();
}
