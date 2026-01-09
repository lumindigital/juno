import { Arguments } from '../../src/api/arguments';
import { DagTask } from '../../src/api/dag-task';
import { DagTemplate } from '../../src/api/dag-template';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { Outputs } from '../../src/api/outputs';
import { InputParameter, OutputParameter } from '../../src/api/parameter';
import { ParameterValueFrom } from '../../src/api/parameter-value-from';
import { Script } from '../../src/api/script';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const resourcesOutputParameter = new OutputParameter('resources', {
        valueFrom: new ParameterValueFrom({
            path: '/tmp/resources.json',
        }),
    });

    const parseResourcesTmplTemplate = new Template('parse-resources-tmpl', {
        outputs: new Outputs({
            parameters: [resourcesOutputParameter],
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
        podSpecPatch: `{"containers":[{"name":"main", "resources":{"limits": ${simpleTag(resourcesInputParameter)}, "requests": ${simpleTag(resourcesInputParameter)} }}]}`,
        script: new Script({
            command: ['sh'],
            image: 'alpine:latest',
            source: `echo ${simpleTag(resourcesInputParameter)}\n`,
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
                                valueFromExpressionArgs: {
                                    dagTask: parseResourcesTask,
                                    output: resourcesOutputParameter,
                                },
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
