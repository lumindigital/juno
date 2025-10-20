import { WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const printMessageTemplate = new Template('print-message', {
        container: new Container({
            args: ['{{workflow.parameters.message}}'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This example demonstrates loading global parameter values from a ConfigMap.\nNote that the "simple-parameters" ConfigMap (defined in `examples/configmaps/simple-parameters-configmap.yaml`) needs to be created first before submitting this workflow.\n',
            },
            generateName: 'global-parameter-values-from-configmap-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('message', {
                        valueFrom: {
                            configMapKeyRef: {
                                key: 'msg',
                                name: 'simple-parameters',
                            },
                        },
                    }),
                ],
            }),
            entrypoint: printMessageTemplate,
        }),
    }).toWorkflow();
}
