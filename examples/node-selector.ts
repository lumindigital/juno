import { WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const archInputParameter = new InputParameter('arch');

    const printArchTemplate = new Template('print-arch', {
        container: new Container({
            args: ['uname -a'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
        inputs: new Inputs({
            parameters: [archInputParameter],
        }),
        nodeSelector: {
            'beta.kubernetes.io/arch': simpleTag(archInputParameter),
        },
    });

    return new Workflow({
        metadata: {
            generateName: 'node-selector-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    archInputParameter.toWorkflowParameter({
                        value: 'amd64',
                    }),
                ],
            }),
            entrypoint: printArchTemplate,
        }),
    }).toWorkflow();
}
