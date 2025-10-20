import { IoArgoprojWorkflowV1Alpha1TemplateRef } from '../workflow-interfaces/data-contracts.js';
import { ClusterWorkflowTemplate } from './cluster-workflow-template.js';
import { Template } from './template.js';
import { WorkflowTemplate } from './workflow-template.js';

/**
 * Represents the Argo Template Configuration
 * @remarks
 *
 * Takes an argo template, and a workflow template returns a template ref of that template
 *
 * @example
 * ```typescript
 *    //example of how to use this class here
 * ```
 *
 * @public
 */
export class TemplateReference {
    template!: Template;

    workflowTemplate!: ClusterWorkflowTemplate | WorkflowTemplate;
    constructor(init?: Partial<TemplateReference>) {
        Object.assign(this, init);
    }

    toTemplateRef(): IoArgoprojWorkflowV1Alpha1TemplateRef {
        let workflowTemplateName: string;

        if (this.workflowTemplate instanceof ClusterWorkflowTemplate && this.workflowTemplate.metadata?.name) {
            workflowTemplateName = this.workflowTemplate.metadata?.name;
        } else if (this.workflowTemplate instanceof WorkflowTemplate && this.workflowTemplate.metadata?.name) {
            workflowTemplateName = this.workflowTemplate.metadata?.name;
        } else {
            throw new Error(
                `metadata.name is required when using a template reference for template named ${this.template.name}`,
            );
        }

        return {
            clusterScope: this.workflowTemplate instanceof ClusterWorkflowTemplate,
            name: workflowTemplateName,
            template: this.template.name,
        };
    }
}
