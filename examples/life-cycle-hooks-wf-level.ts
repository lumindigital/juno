import { Container } from '../src/api/container';
import { LifecycleHook } from '../src/api/lifecycle-hook';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const headsTemplate = new Template('heads', {
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
                new WorkflowStep('step1', {
                    template: headsTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'lifecycle-hook-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
            hooks: [
                new LifecycleHook('exit', {
                    template: httpTemplate,
                }),
                new LifecycleHook('running', {
                    expression: 'workflow.status == "Running"',
                    template: httpTemplate,
                }),
            ],
        }),
    }).toWorkflow();
}
