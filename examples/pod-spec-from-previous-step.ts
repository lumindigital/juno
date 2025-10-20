import { Arguments } from '../src/api/arguments';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const parseResourcesTmplTemplate = new Template('parse-resources-tmpl', {
        outputs: new Outputs({
            parameters: [
                new OutputParameter('resources', {
                    valueFrom: {
                        path: '/tmp/resources.json',
                    },
                }),
            ],
        }),
        script: new Script({
            command: ['sh'],
            image: 'alpine:latest',
            source: 'echo \'{"memory": "10Gi", "cpu": "2000m"}\' > /tmp/resources.json && cat /tmp/resources.json\n',
        }),
    });

    const resourcesInputParameter = new InputParameter('resources');

    const setupResourcesTmplTemplate = new Template('setup-resources-tmpl', {
        inputs: new Inputs({
            parameters: [resourcesInputParameter],
        }),
        podSpecPatch:
            '{"containers":[{"name":"main", "resources":{"limits": {{inputs.parameters.resources}}, "requests": {{inputs.parameters.resources}} }}]}',
        script: new Script({
            command: ['sh'],
            image: 'alpine:latest',
            source: 'echo {{inputs.parameters.resources}}\n',
        }),
    });

    const parseResourcesTask = new DagTask('parse-resources', {
        template: parseResourcesTmplTemplate,
    });

    const workflowTemplate = new Template('workflow', {
        dag: new DagTemplate({
            tasks: [
                parseResourcesTask,
                new DagTask('setup-resources', {
                    arguments: new Arguments({
                        parameters: [
                            resourcesInputParameter.toArgumentParameter({
                                value: '{{tasks.parse-resources.outputs.parameters.resources}}',
                            }),
                        ],
                    }),
                    depends: parseResourcesTask,
                    template: setupResourcesTmplTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'pod-spec-from-previous-step-',
        },
        spec: new WorkflowSpec({
            entrypoint: workflowTemplate,
        }),
    }).toWorkflow();
}
