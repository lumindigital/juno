import { Arguments } from '../../src/api/arguments';
import { simpleTag } from '../../src/api/expressions/tag';
import { Inputs } from '../../src/api/inputs';
import { InputParameter } from '../../src/api/parameter';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const urlInputParameter = new InputParameter('url');

    const httpTemplate = new Template('http', {
        http: {
            url: simpleTag(urlInputParameter).toString(),
        },
        inputs: new Inputs({
            parameters: [urlInputParameter],
        }),
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('good', {
                    arguments: new Arguments({
                        parameters: [
                            urlInputParameter.toArgumentParameter({
                                value: 'https://raw.githubusercontent.com/argoproj/argo-workflows/4e450e250168e6b4d51a126b784e90b11a0162bc/pkg/apis/workflow/v1alpha1/generated.swagger.json',
                            }),
                        ],
                    }),
                    template: httpTemplate,
                }),
                new WorkflowStep('bad', {
                    arguments: new Arguments({
                        parameters: [
                            urlInputParameter.toArgumentParameter({
                                value: 'https://raw.githubusercontent.com/argoproj/argo-workflows/thisisnotahash/pkg/apis/workflow/v1alpha1/generated.swagger.json',
                            }),
                        ],
                    }),
                    continueOn: {
                        failed: true,
                    },
                    template: httpTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': 'Http template will demostrate http template functionality\n',
                'workflows.argoproj.io/version': '>= 3.2.0',
            },
            generateName: 'http-template-',
            labels: {
                'workflows.argoproj.io/test': 'true',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
