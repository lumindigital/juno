import { WorkflowArguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowParameter } from '../../src/api/parameter';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../../src/api/expression';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const memLimit = new WorkflowParameter('mem-limit', { value: '100Mi' });

    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'pod-spec-patch-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [memLimit],
            }),
            entrypoint: helloWorldTemplate,
            podSpecPatch: `containers:\n  - name: main\n    resources:\n      limits:\n        memory: "${simpleTag(memLimit)}"\n`,
        }),
    }).toWorkflow();
}
