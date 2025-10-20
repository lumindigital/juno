import { Outputs } from '../src/api/outputs';
import { OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const randNumTemplate = new Template('rand-num', {
        outputs: new Outputs({
            parameters: [
                new OutputParameter('job-name', {
                    valueFrom: {
                        jsonPath: '{.metadata.name}',
                    },
                }),
                new OutputParameter('job-obj', {
                    valueFrom: {
                        jqFilter: '.',
                    },
                }),
            ],
        }),
        resource: {
            action: 'create',
            failureCondition: 'status.failed > 1',
            manifest: `apiVersion: batch/v1
kind: Job
metadata:
  generateName: rand-num-
spec:
  completions: 3
  parallelism: 3
  template:
    metadata:
      name: rand
    spec:
      containers:
      - name: rand
        image: python:alpine3.6
        command: ["python", "-c", "import random; import time; print(random.randint(1, 1000)); time.sleep(10)"]
      restartPolicy: Never
`,
            setOwnerReference: true,
            successCondition: 'status.succeeded > 2',
        },
    });

    return new Workflow({
        metadata: {
            name: 'k8s-jobs',
        },
        spec: new WorkflowSpec({
            entrypoint: randNumTemplate,
        }),
    }).toWorkflow();
}
