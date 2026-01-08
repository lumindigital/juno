import { WorkflowArguments } from '../../src/api/arguments';
import { Container } from '../../src/api/container';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../src/api/parameter';
import { ParameterValueFrom } from '../../src/api/parameter-value-from';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const messageInputParameter = new InputParameter('message');

    const printMessageTemplate = new Template('print-message', {
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
                    'This example demonstrates how a global parameter from a ConfigMap can be referenced as a template local variable.\nNote that the "simple-parameters" ConfigMap (defined in `examples/configmaps/simple-parameters-configmap.yaml`) needs to be created first before submitting this workflow.\n',
            },
            generateName: 'global-parameter-from-configmap-referenced-as-local-variable-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('message', {
                        valueFrom: new ParameterValueFrom({
                            configMapKeyRef: {
                                key: 'msg',
                                name: 'simple-parameters',
                            },
                        }),
                    }),
                ],
            }),
            entrypoint: printMessageTemplate,
        }),
    }).toWorkflow();
}
