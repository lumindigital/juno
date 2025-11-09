import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Outputs } from '../src/api/outputs';
import { OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';
import { simpleTag } from '../src/api/expression';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const deployTemplate = new Template('deploy', {
        container: new Container({
            args: ['echo', 'deploying'],
            command: ['/argosay'],
            image: 'argoproj/argosay:v2',
        }),
    });

    const approveInputParameter = new InputParameter('approve', {
        default: 'NO',
        description: 'Choose YES to continue workflow and deploy to production',
        enum: ['YES', 'NO'],
    });

    const approveOutputParameter = new OutputParameter('approve', {
        valueFrom: {
            supplied: {},
        },
    });

    const approvalTemplate = new Template('approval', {
        inputs: new Inputs({
            parameters: [approveInputParameter],
        }),
        outputs: new Outputs({
            parameters: [approveOutputParameter],
        }),
        suspend: {},
    });

    const approvalStep = new WorkflowStep('approval', {
        template: approvalTemplate,
    });

    const cicdPipelineTemplate = new Template('cicd-pipeline', {
        steps: [
            [
                new WorkflowStep('deploy-pre-prod', {
                    template: deployTemplate,
                }),
            ],
            [approvalStep],
            [
                new WorkflowStep('deploy-prod', {
                    template: deployTemplate,
                    when: `${simpleTag({ workflowStep: approvalStep, output: approveOutputParameter })} == YES`,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'intermediate-parameters-cicd-',
        },
        spec: new WorkflowSpec({
            entrypoint: cicdPipelineTemplate,
        }),
    }).toWorkflow();
}
