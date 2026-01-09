import { IoArgoprojWorkflowV1Alpha1DAGTemplate } from '../workflow-interfaces/data-contracts.js';
import { DagTask } from './dag-task.js';
import { ExpressionArgs } from './expressions/types.js';
import { simpleTag, UndefinedExpressionArg } from './expressions/tag.js';

export class DagTemplate {
    failFast?: boolean;
    target?: string;
    targets?: ExpressionArgs[] | UndefinedExpressionArg[];
    tasks!: DagTask[];

    constructor(init: Partial<DagTemplate>) {
        Object.assign(this, init);
    }

    toDagTemplate(templateName: string): IoArgoprojWorkflowV1Alpha1DAGTemplate {
        this.validateMutuallyExclusive(templateName);

        let target: string | undefined = undefined;

        if (this.target) {
            target = this.target;
        } else if (this.targets && this.targets.length > 0) {
            target = this.targets.map((t) => simpleTag(t)).join(', ');
        }

        return {
            failFast: this.failFast,
            target: target,
            tasks: this.tasks.map((x) => x.toDagTask(templateName)),
        };
    }

    validateMutuallyExclusive(templateName: string): void {
        let count = 0;
        if (this.target) {
            count++;
        }

        if (this.targets && this.targets.length > 0) {
            count++;
        }

        if (count > 1) {
            throw new Error(`target and targets are mutually exclusive in DagTemplate for dag named ${templateName}`);
        }
    }
}
