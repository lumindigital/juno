import { WorkflowArguments } from '../src/api/arguments';
import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter, WorkflowParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const linesCountInputParameter = new InputParameter('lines-count');
    const linesCountWorkflowParameter = new WorkflowParameter('lines-count', { value: '3' });
    const textInputArtifact = new InputArtifact('text', {
        path: '/inputs/text/data',
    });

    const actualLinesCountOutputParameter = new OutputParameter('actual-lines-count', {
        valueFrom: {
            path: '/outputs/actual-lines-count/data',
        },
    });
    const textOutputArtifact = new OutputArtifact('text', {
        path: '/outputs/text/data',
    });

    const headLinesTemplate = new Template('head-lines', {
        container: new Container({
            command: [
                'sh',
                '-c',
                'mkdir -p "$(dirname "{{outputs.artifacts.text.path}}")" "$(dirname "{{outputs.parameters.actual-lines-count.path}}")" ; head -n {{inputs.parameters.lines-count}} < "{{inputs.artifacts.text.path}}" | tee "{{outputs.artifacts.text.path}}" | wc -l > "{{outputs.parameters.actual-lines-count.path}}"',
            ],
            image: 'busybox',
        }),
        inputs: new Inputs({
            artifacts: [textInputArtifact],
            parameters: [linesCountInputParameter],
        }),
        outputs: new Outputs({
            artifacts: [textOutputArtifact],
            parameters: [actualLinesCountOutputParameter],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'artifact-path-placeholders-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                artifacts: [
                    textInputArtifact.toArgumentArtifact({
                        raw: {
                            data: '1\n2\n3\n4\n5\n',
                        },
                    }),
                ],
                parameters: [linesCountWorkflowParameter],
            }),
            entrypoint: headLinesTemplate,
        }),
    }).toWorkflow();
}
