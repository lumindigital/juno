import { Arguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../../src/api/expressions/tag';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const timeoutInputParameter = new InputParameter('timeout');

    const echoTemplate = new Template('echo', {
        container: new Container({
            command: ['sleep', '15s'],
            image: 'alpine:3.7',
        }),
        inputs: new Inputs({
            parameters: [timeoutInputParameter],
        }),
        timeout: simpleTag(timeoutInputParameter).toString(),
    });

    const dagTaskA = new DagTask('A', {
        arguments: new Arguments({
            parameters: [timeoutInputParameter.toArgumentParameter({ value: '20s' })],
        }),
        template: echoTemplate,
    });
    const dagTaskB = new DagTask('B', {
        arguments: new Arguments({
            parameters: [timeoutInputParameter.toArgumentParameter({ value: '10s' })],
        }),
        depends: dagTaskA,
        template: echoTemplate,
    });
    const dagTaskC = new DagTask('C', {
        arguments: new Arguments({
            parameters: [timeoutInputParameter.toArgumentParameter({ value: '20s' })],
        }),
        depends: dagTaskA,
        template: echoTemplate,
    });

    const diamondTemplate = new Template('diamond', {
        dag: new DagTemplate({
            tasks: [dagTaskA, dagTaskB, dagTaskC],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'dag-task-level-timeout-',
        },
        spec: new WorkflowSpec({
            entrypoint: diamondTemplate,
        }),
    }).toWorkflow();
}
