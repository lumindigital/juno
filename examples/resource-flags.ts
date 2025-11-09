import { simpleTag } from '../src/api/expression';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const createRouteTemplate = new Template('create-route', {
        resource: {
            action: 'create',
            manifest: `apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: host-route
spec:
  to:
    kind: Service
    name: service-name
`,
        },
    });

    const createRouteWithoutValidationTemplate = new Template('create-route-without-validation', {
        resource: {
            action: 'create',
            flags: ['--validate=false'],
            manifest: `apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: host-route
spec:
  to:
    kind: Service
    name: service-name
`,
        },
    });

    const submitResourceStep = new WorkflowStep('submit-resource', {
        continueOn: {
            failed: true,
        },
        template: createRouteTemplate,
    });

    const resourceValidateExampleTemplate = new Template('resource-validate-example', {
        steps: [
            [submitResourceStep],
            [
                new WorkflowStep('submit-resource-without-validation', {
                    template: createRouteWithoutValidationTemplate,
                    when: `${simpleTag({ workflowStep: submitResourceStep, output: 'status' })} == Failed`,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'resource-validate-',
        },
        spec: new WorkflowSpec({
            entrypoint: resourceValidateExampleTemplate,
        }),
    }).toWorkflow();
}
