import { WorkflowArguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowParameter } from '../../src/api/parameter';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../../src/api/expressions/tag';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const cpuLimit = new WorkflowParameter('cpu-limit', { value: '100m' });
    const memLimit = new WorkflowParameter('mem-limit', { value: '100Mi' });

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
                parameters: [cpuLimit, memLimit],
            }),
            entrypoint: helloWorldTemplate,
            podSpecPatch: `containers:\n  - name: main\n    resources:\n      limits:\n        memory: "${simpleTag(memLimit)}"\n`,
        }),
    }).toWorkflow();
}
