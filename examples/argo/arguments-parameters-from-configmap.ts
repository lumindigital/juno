import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { simpleTag } from '../../src/api/expressions/tag';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';
import { ParameterValueFrom } from '../../src/api/parameter-value-from';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message', {
        valueFrom: new ParameterValueFrom({
            configMapKeyRef: {
                key: 'msg',
                name: 'simple-parameters',
            },
        }),
    });

    const printMessageFromConfigmapTemplate = new Template('print-message-from-configmap', {
        container: new Container({
            args: [simpleTag(messageInputParameter).toString()],
            command: ['echo'],
            image: 'busybox',
        }),
        inputs: new Inputs({
            parameters: [messageInputParameter],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This example demonstrates loading parameter values from a ConfigMap.\nNote that the "simple-parameters" ConfigMap (defined in `examples/configmaps/simple-parameters-configmap.yaml`) needs to be created first before submitting this workflow.\n',
                'workflows.argoproj.io/verify.py': 'assert status["phase"] == "Succeeded"\n',
            },
            generateName: 'arguments-parameters-from-configmap-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: printMessageFromConfigmapTemplate,
        }),
    }).toWorkflow();
}
