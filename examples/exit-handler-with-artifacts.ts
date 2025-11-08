import { Arguments } from '../src/api/arguments';
import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { LifecycleHook } from '../src/api/lifecycle-hook';
import { Outputs } from '../src/api/outputs';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const resultOutputArtifact = new OutputArtifact('result', {
        path: '/result.txt',
    });

    const outputTemplate = new Template('output', {
        outputs: new Outputs({
            artifacts: [resultOutputArtifact],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `with open("result.txt", "w") as f:
  f.write("Welcome")
`,
        }),
    });

    const messageInputArtifact = new InputArtifact('message', {
        path: '/tmp/message',
    });

    const exitTemplate = new Template('exit', {
        container: new Container({
            args: ['cat /tmp/message'],
            command: ['sh', '-c'],
            image: 'python:alpine3.6',
        }),
        inputs: new Inputs({
            artifacts: [messageInputArtifact],
        }),
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('step-1', {
                    hooks: [
                        new LifecycleHook('exit', {
                            arguments: new Arguments({
                                artifacts: [
                                    messageInputArtifact.toArgumentArtifact({
                                        from: simpleTag({ workflowStepName: 'step-1', output: resultOutputArtifact }),
                                    }),
                                ],
                            }),
                            template: exitTemplate,
                        }),
                    ],
                    template: outputTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'onExitTemplate enables workflow to pass the arguments (parameters/Artifacts) to exit handler template.\n',
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'exit-handler-with-artifacts-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
