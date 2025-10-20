import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { LifecycleHook } from '../src/api/lifecycle-hook';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const outputTemplate = new Template('output', {
        container: new Container({
            args: ['echo -n hello world > /tmp/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'python:alpine3.6',
        }),
        outputs: new Outputs({
            parameters: [
                new OutputParameter('result', {
                    valueFrom: {
                        default: 'Foobar',
                        path: '/tmp/hello_world.txt',
                    },
                }),
            ],
        }),
    });

    const messageInputParameter = new InputParameter('message');
    const exitTemplateInputs = new Inputs({
        parameters: [messageInputParameter],
    });

    const exitTemplate = new Template('exit', {
        inputs: exitTemplateInputs,
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `print("${simpleTag(exitTemplateInputs.parameters?.[0] as InputParameter)}")\n`,
        }),
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('step-1', {
                    hooks: [],
                    template: outputTemplate,
                }),
            ],
        ],
    });

    mainTemplate.steps?.[0][0]?.hooks?.push(
        new LifecycleHook('exit', {
            arguments: new Arguments({
                parameters: [
                    messageInputParameter.toArgumentParameter({
                        value: simpleTag({
                            parameter: outputTemplate.outputs?.parameters?.[0] as OutputParameter,
                            task: mainTemplate.steps?.[0][0],
                        }),
                    }),
                ],
            }),
            template: exitTemplate,
        }),
    );

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'onExitTemplate enables workflow to pass the arguments (parameters/Artifacts) to exit handler template.\n',
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'exit-handler-with-param-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
