import { IoArgoprojWorkflowV1Alpha1DAGTemplate } from '../workflow-interfaces/data-contracts.js';
import { DagTask } from './dag-task.js';

export class DagTemplate {
    failFast?: boolean;
    target?: string;
    tasks!: DagTask[];

    constructor(init: Partial<DagTemplate>) {
        Object.assign(this, init);
    }

    toDagTemplate(): IoArgoprojWorkflowV1Alpha1DAGTemplate {
        return {
            failFast: this.failFast,
            target: this.target,
            tasks: this.tasks.map((x) => x.toDagTask()),
        };
    }
}
