import { WorkflowArguments } from '../src/api/arguments';
import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const linesCountInputParameter = new InputParameter('lines-count');
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
                `mkdir -p "$(dirname "${simpleTag({ pathResult: textOutputArtifact })}")" "$(dirname "${simpleTag({ pathResult: actualLinesCountOutputParameter })}")" ; head -n ${simpleTag(linesCountInputParameter)} < "${simpleTag({ pathResult: textInputArtifact })}" | tee "${simpleTag({ pathResult: textOutputArtifact })}" | wc -l > "${simpleTag({ pathResult: actualLinesCountOutputParameter })}"`,
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
                parameters: [
                    linesCountInputParameter.toWorkflowParameter({
                        value: '3',
                    }),
                ],
            }),
            entrypoint: headLinesTemplate,
        }),
    }).toWorkflow();
}
