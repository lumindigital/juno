import { WorkflowArguments } from '../src/api/arguments';
import { ClusterWorkflowTemplate } from '../src/api/cluster-workflow-template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { SharedTemplates } from './shared-templates';

export class ClusterWorkflowTemplates {
    // Templates here differ slightly from the examples in the argo project. Juno requires an entrypoint template to be specified.
    // The preferred way to use Juno templates is to not use template references.
    public static printMessageClusterWorkflowTemplate = new ClusterWorkflowTemplate({
        metadata: {
            name: 'cluster-workflow-template-print-message',
        },
        spec: new WorkflowSpec({
            entrypoint: SharedTemplates.printMessageTemplate,
        }),
    });

    public static workflowTemplateRandomFail = new ClusterWorkflowTemplate({
        metadata: {
            name: 'cluster-workflow-template-random-fail-template',
        },
        spec: new WorkflowSpec({
            entrypoint: SharedTemplates.randomFailTemplate,
        }),
    });

    public static innerStepsClusterWorkflowTemplate = new ClusterWorkflowTemplate({
        metadata: {
            name: 'cluster-workflow-template-inner-steps',
        },
        spec: new WorkflowSpec({
            entrypoint: SharedTemplates.innerStepsTemplate,
        }),
    });

    public static innerDagClusterWorkflowTemplate = new ClusterWorkflowTemplate({
        metadata: {
            name: 'cluster-workflow-template-inner-dag',
        },
        spec: new WorkflowSpec({
            entrypoint: SharedTemplates.innerDiamondTemplate,
        }),
    });

    public static submittableClusterWorkflowTemplate = new ClusterWorkflowTemplate({
        metadata: {
            name: 'cluster-workflow-template-submittable',
        },
        spec: new WorkflowSpec({
            entrypoint: SharedTemplates.printMessageTemplate,
            arguments: new WorkflowArguments({
                parameters: [SharedTemplates.messageInputParameter.toWorkflowParameter({ value: 'hello world' })],
            }),
        }),
    });
}
