import { ClusterWorkflowTemplates } from '../../example-helpers/cluster-workflow-templates';
import { SharedTemplates } from '../../example-helpers/shared-templates';
import { Arguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { and } from '../../src/api/expr-api';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { TemplateReference } from '../../src/api/template-reference';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const aTask = new DagTask('A', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'A' })],
        }),
        templateRef: new TemplateReference({
            workflowTemplate: ClusterWorkflowTemplates.printMessageClusterWorkflowTemplate,
            template: SharedTemplates.printMessageTemplate,
        }),
    });

    const bTask = new DagTask('B', {
        arguments: new Arguments({
            parameters: [messageInputParameter.toArgumentParameter({ value: 'B' })],
        }),
        depends: aTask,
        templateRef: new TemplateReference({
            workflowTemplate: ClusterWorkflowTemplates.printMessageClusterWorkflowTemplate,
            template: SharedTemplates.printMessageTemplate,
        }),
    });

    const cTask = new DagTask('C', {
        depends: aTask,
        templateRef: new TemplateReference({
            workflowTemplate: ClusterWorkflowTemplates.innerDagClusterWorkflowTemplate,
            template: SharedTemplates.innerDiamondTemplate,
        }),
    });

    const diamondTemplate = new Template('diamond', {
        dag: new DagTemplate({
            tasks: [
                aTask,
                bTask,
                cTask,
                new DagTask('D', {
                    arguments: new Arguments({
                        parameters: [messageInputParameter.toArgumentParameter({ value: 'D' })],
                    }),
                    depends: and([bTask, cTask]),
                    templateRef: new TemplateReference({
                        workflowTemplate: ClusterWorkflowTemplates.printMessageClusterWorkflowTemplate,
                        template: SharedTemplates.printMessageTemplate,
                    }),
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'workflow-template-dag-diamond-',
        },
        spec: new WorkflowSpec({
            entrypoint: diamondTemplate,
        }),
    }).toWorkflow();
}
