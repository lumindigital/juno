import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const fooInputParameter = new InputParameter('foo');

    const pod0Template = new Template('pod-0', {
        container: new Container({
            args: [
                'echo',
                "hello {{=asInt(inputs.parameters.foo) * 10}} @ {{=sprig.date('2006', workflow.creationTimestamp)}}\n",
                '/output',
            ],
            image: 'argoproj/argosay:v2',
        }),
        inputs: new Inputs({
            parameters: [fooInputParameter],
        }),
        outputs: new Outputs({
            parameters: [
                new OutputParameter('output', {
                    valueFrom: {
                        path: '/output',
                    },
                }),
            ],
        }),
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('task-0', {
                    arguments: new Arguments({
                        parameters: [fooInputParameter.toArgumentParameter({ value: '{{=item}}' })],
                    }),
                    template: pod0Template,
                    withParam: '{{=toJson(filter([1, 3], {# > 1}))}}',
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/version': '>= 3.1.0',
            },
            generateName: 'expression-tag-template-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
