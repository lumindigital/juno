import { IoArgoprojWorkflowV1Alpha1WorkflowTemplateRef } from '../workflow-interfaces/data-contracts.js';
import { ClusterWorkflowTemplate } from './cluster-workflow-template.js';
import { TemplateReference } from './template-reference.js';
import { WorkflowTemplate } from './workflow-template.js';

export class WorkflowTemplateReference {
    workflowTemplate!: ClusterWorkflowTemplate | WorkflowTemplate;
    constructor(init?: Partial<TemplateReference>) {
        Object.assign(this, init);
    }

    toWorkflowTemplateReference(): IoArgoprojWorkflowV1Alpha1WorkflowTemplateRef {
        let templateName: string;

        if (this.workflowTemplate instanceof ClusterWorkflowTemplate && this.workflowTemplate.metadata?.name) {
            templateName = this.workflowTemplate.metadata?.name;
        } else if (this.workflowTemplate instanceof WorkflowTemplate && this.workflowTemplate.metadata?.name) {
            templateName = this.workflowTemplate.metadata?.name;
        } else {
            throw new Error('metadata.name is required when using a workflow template reference');
        }

        return {
            clusterScope: this.workflowTemplate instanceof ClusterWorkflowTemplate,
            name: templateName,
        };
    }
}
