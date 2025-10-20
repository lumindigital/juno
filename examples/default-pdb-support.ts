import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const pdbcreateTemplate = new Template('pdbcreate', {
        container: new Container({
            args: ['sleep 10'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'default-pdb-support-',
        },
        spec: new WorkflowSpec({
            entrypoint: pdbcreateTemplate,
            podDisruptionBudget: {
                minAvailable: '9999',
            },
            serviceAccountName: 'default',
        }),
    }).toWorkflow();
}
