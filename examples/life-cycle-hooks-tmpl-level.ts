import { Container } from '../src/api/container';
import { LifecycleHook } from '../src/api/lifecycle-hook';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const echoTemplate = new Template('echo', {
        container: new Container({
            args: ['echo "it was heads"'],
            command: ['sh', '-c'],
            image: 'alpine:3.6',
        }),
    });

    const httpTemplate = new Template('http', {
        http: {
            url: 'https://raw.githubusercontent.com/argoproj/argo-workflows/4e450e250168e6b4d51a126b784e90b11a0162bc/pkg/apis/workflow/v1alpha1/generated.swagger.json',
        },
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('step-1', {
                    hooks: [
                        new LifecycleHook('running', {
                            expression: 'steps["step-1"].status == "Running"',
                            template: httpTemplate,
                        }),
                        new LifecycleHook('success', {
                            expression: 'steps["step-1"].status == "Succeeded"',
                            template: httpTemplate,
                        }),
                    ],
                    template: echoTemplate,
                }),
            ],
            [
                new WorkflowStep('step2', {
                    hooks: [
                        new LifecycleHook('running', {
                            expression: 'steps.step2.status == "Running"',
                            template: httpTemplate,
                        }),
                        new LifecycleHook('success', {
                            expression: 'steps.step2.status == "Succeeded"',
                            template: httpTemplate,
                        }),
                    ],
                    template: echoTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'lifecycle-hook-tmpl-level-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
