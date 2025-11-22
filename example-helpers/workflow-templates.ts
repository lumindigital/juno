import { WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowTemplate } from '../src/api/workflow-template';
import { SharedTemplates } from './shared-templates';

// Templates here differ slightly from the examples in the argo project. Juno requires an entrypoint template to be specified.
// The preferred way to use Juno templates is to not use template references.
export class WorkflowTemplates {
    public static randomFailTemplate = new Template('random-fail-template', {
        retryStrategy: {
            limit: '10',
        },
        container: new Container({
            image: 'python:alpine3.6',
            command: ['python', '-c'],
            // fail with a 66% probability
            args: ['import random; import sys; exit_code = random.choice([0, 1, 1]); sys.exit(exit_code)'],
        }),
    });

    public static randomFailWorkflowTemplate = new WorkflowTemplate({
        metadata: {
            name: 'workflow-template-random-fail-template',
        },
        spec: new WorkflowSpec({
            entrypoint: WorkflowTemplates.randomFailTemplate,
        }),
    });

    public static innerStepsWorkflowTemplate = new WorkflowTemplate({
        metadata: {
            name: 'workflow-template-inner-steps',
        },
        spec: new WorkflowSpec({
            entrypoint: SharedTemplates.innerStepsTemplate,
        }),
    });

    public static innerDagWorkflowTemplate = new WorkflowTemplate({
        metadata: {
            name: 'workflow-template-inner-dag',
        },
        spec: new WorkflowSpec({
            entrypoint: SharedTemplates.innerDiamondTemplate,
        }),
    });

    public static submittableWorkflowTemplate = new WorkflowTemplate({
        metadata: {
            name: 'workflow-template-submittable',
        },
        spec: new WorkflowSpec({
            entrypoint: SharedTemplates.printMessageTemplate,
            arguments: new WorkflowArguments({
                parameters: [SharedTemplates.messageInputParameter.toWorkflowParameter({ value: 'hello world' })],
            }),
        }),
    });
}
