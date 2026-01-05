import { Arguments } from '../../src/api/arguments';
import { OutputResult } from '../../src/api/artifact';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expression';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const genRandomIntTemplate = new Template('gen-random-int', {
        script: new Script({
            command: ['node'],
            image: 'node:9.1-alpine',
            source: `var rand = Math.floor(Math.random() * 100);
console.log(rand);
`,
        }),
    });

    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: ['echo result was: ' + simpleTag(messageInputParameter)],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    const generateStep = new WorkflowStep('generate', {
        template: genRandomIntTemplate,
    });

    const javascriptScriptExampleTemplate = new Template('javascript-script-example', {
        steps: [
            [generateStep],
            [
                new WorkflowStep('print', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: { workflowStep: generateStep, output: new OutputResult() },
                            }),
                        ],
                    }),
                    template: printMessageTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'scripts-javascript-',
        },
        spec: new WorkflowSpec({
            entrypoint: javascriptScriptExampleTemplate,
        }),
    }).toWorkflow();
}
