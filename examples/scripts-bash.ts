import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const genRandomIntTemplate = new Template('gen-random-int', {
        script: new Script({
            command: ['bash'],
            image: 'debian:9.4',
            source: `cat /dev/urandom | od -N2 -An -i | awk -v f=1 -v r=100 '{printf "%i\\n", f + r * $1 / 65536}'
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

    const bashScriptExampleTemplate = new Template('bash-script-example', {
        steps: [
            [
                new WorkflowStep('generate', {
                    template: genRandomIntTemplate,
                }),
            ],
            [
                new WorkflowStep('print', {
                    arguments: new Arguments({
                        parameters: [
                            messageInputParameter.toArgumentParameter({ value: '{{steps.generate.outputs.result}}' }),
                        ],
                    }),
                    template: printMessageTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'scripts-bash-',
        },
        spec: new WorkflowSpec({
            entrypoint: bashScriptExampleTemplate,
        }),
    }).toWorkflow();
}
