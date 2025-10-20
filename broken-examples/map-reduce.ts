import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { InputArtifact, OutputArtifact } from '../src/api/artifact';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, WorkflowParameter } from '../src/api/parameter';
import { Script } from '../src/api/script';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const numPartsInputParameter = new InputParameter('numParts');

    const splitTemplate = new Template('split', {
        inputs: new Inputs({
            parameters: [numPartsInputParameter],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('parts', {
                    archive: {
                        none: {},
                    },
                    path: '/mnt/out',
                    s3: {
                        key: '{{workflow.name}}/parts',
                    },
                }),
            ],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import json
import os
import sys
os.mkdir("/mnt/out")
partIds = list(map(lambda x: str(x), range({{inputs.parameters.numParts}})))
for i, partId in enumerate(partIds, start=1):
  with open("/mnt/out/" + partId + ".json", "w") as f:
    json.dump({"foo": i}, f)
json.dump(partIds, sys.stdout)
`,
        }),
    });

    const partIdInputParameter = new InputParameter('partId');
    const partInputArtifact = new InputArtifact('part', {
        path: '/mnt/in/part.json',
    });

    const mapTemplate = new Template('map', {
        inputs: new Inputs({
            artifacts: [partInputArtifact],
            parameters: [partIdInputParameter],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('part', {
                    archive: {
                        none: {},
                    },
                    path: '/mnt/out/part.json',
                    s3: {
                        key: '{{workflow.name}}/results/{{inputs.parameters.partId}}.json',
                    },
                }),
            ],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import json
import os
import sys
os.mkdir("/mnt/out")
with open("/mnt/in/part.json") as f:
  part = json.load(f)
with open("/mnt/out/part.json", "w") as f:
  json.dump({"bar": part["foo"] * 2}, f)
`,
        }),
    });

    const reduceTemplate = new Template('reduce', {
        inputs: new Inputs({
            artifacts: [
                new InputArtifact('results', {
                    path: '/mnt/in',
                    s3: {
                        key: '{{workflow.name}}/results',
                    },
                }),
            ],
        }),
        outputs: new Outputs({
            artifacts: [
                new OutputArtifact('total', {
                    archive: {
                        none: {},
                    },
                    path: '/mnt/out/total.json',
                    s3: {
                        key: '{{workflow.name}}/total.json',
                    },
                }),
            ],
        }),
        script: new Script({
            command: ['python'],
            image: 'python:alpine3.6',
            source: `import json
import os
import sys
total = 0
os.mkdir("/mnt/out")
for f in list(map(lambda x: open("/mnt/in/" + x), os.listdir("/mnt/in"))):
  result = json.load(f)
  total = total + result["bar"]
with open("/mnt/out/total.json" , "w") as f:
  json.dump({"total": total}, f)
`,
        }),
    });

    const splitTask = new DagTask('split', {
        arguments: new Arguments({
            parameters: [numPartsInputParameter.toArgumentParameter({ value: '{{workflow.parameters.numParts}}' })],
        }),
        template: splitTemplate,
    });

    const mapTask = new DagTask('map', {
        arguments: new Arguments({
            artifacts: [
                partInputArtifact.toArgumentArtifact({
                    s3: {
                        key: '{{workflow.name}}/parts/{{item}}.json',
                    },
                }),
            ],
            parameters: [partIdInputParameter.toArgumentParameter({ value: '{{item}}' })],
        }),
        depends: splitTask,
        template: mapTemplate,
        withParam: '{{tasks.split.outputs.result}}',
    });

    const mainTemplate = new Template('main', {
        dag: new DagTemplate({
            tasks: [
                splitTask,
                mapTask,
                new DagTask('reduce', {
                    depends: mapTask,
                    template: reduceTemplate,
                }),
            ],
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description':
                    'This workflow demonstrates map-reduce using "key-only" artifacts.\nThe first task "split" produces a number of parts, each in the form of a JSON document, saving it to a bucket.\nEach "map" task then reads those documents, performs a map operation, and writes them out to a new bucket.\nFinally, "reduce" merges all the mapped documents into a final document.\n',
                'workflows.argoproj.io/version': '>= 3.0.0',
            },
            generateName: 'map-reduce-',
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [new WorkflowParameter('numParts', { value: '4' })],
            }),
            entrypoint: mainTemplate,
        }),
    }).toWorkflow();
}
