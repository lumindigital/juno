import { Arguments } from '../src/api/arguments';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const urlInputParameter = new InputParameter('url');

    const httpStatusIs201Template = new Template('http-status-is-201', {
        http: {
            successCondition: 'response.statusCode == 201',
            url: simpleTag(urlInputParameter),
        },
        inputs: new Inputs({
            parameters: [urlInputParameter],
        }),
    });

    const httpBodyContainsGoogleTemplate = new Template('http-body-contains-google', {
        http: {
            successCondition: 'response.body contains "google"',
            url: simpleTag(urlInputParameter),
        },
        inputs: new Inputs({
            parameters: [urlInputParameter],
        }),
    });

    const httpHeadersContainsCloudflareTemplate = new Template('http-headers-contains-cloudflare', {
        http: {
            successCondition: 'response.headers["Server"][0] == "cloudflare"',
            url: simpleTag(urlInputParameter),
        },
        inputs: new Inputs({
            parameters: [urlInputParameter],
        }),
    });

    const mainTemplate = new Template('main', {
        steps: [
            [
                new WorkflowStep('http-status-is-201-succeeds', {
                    arguments: new Arguments({
                        parameters: [urlInputParameter.toArgumentParameter({ value: 'http://httpstat.us/201' })],
                    }),
                    template: httpStatusIs201Template,
                }),
                new WorkflowStep('http-body-contains-google-succeeds', {
                    arguments: new Arguments({
                        parameters: [urlInputParameter.toArgumentParameter({ value: 'https://google.com' })],
                    }),
                    template: httpBodyContainsGoogleTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'Exemplifies usage of successCondition in HTTP template (available since v3.3)\n',
            },
            generateName: 'http-template-condition-',
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
            additionalTemplates: [httpHeadersContainsCloudflareTemplate],
        }),
    }).toWorkflow();
}
