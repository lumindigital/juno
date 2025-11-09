import { WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const cpuLimit = new WorkflowParameter('cpu-limit', {
        value: '100m',
    });

    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
        podSpecPatch: `{"containers":[{"name":"main", "resources":{"limits":{"cpu": "${simpleTag(cpuLimit)}" }}}]}`,
    });

    return new Workflow({
        metadata: {
            generateName: 'pod-spec-patch-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [cpuLimit],
            }),
            entrypoint: helloWorldTemplate,
        }),
    }).toWorkflow();
}
