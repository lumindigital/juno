import { WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        container: new Container({
            image: 'argoproj/argosay:v2',
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This examples show you how to add labels based on an expression.\nYou can then query workflows based on the parameters they were invoked with.\nIn this specific case, the value of foo will set as a label on the workflow.\n',
                'workflows.argoproj.io/version': '>= v3.3.0',
            },
            generateName: 'label-value-from-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    new WorkflowParameter('foo', {
                        value: 'bar',
                    }),
                ],
            }),
            entrypoint: mainTemplate,
            workflowMetadata: {
                labelsFrom: {
                    foo: {
                        expression: 'workflow.parameters.foo',
                    },
                },
            },
        }),
    }).toWorkflow();
}
