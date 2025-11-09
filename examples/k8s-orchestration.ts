import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { Outputs } from '../src/api/outputs';
import { InputParameter, OutputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const jobNameOutput = new OutputParameter('job-name', {
        valueFrom: {
            jsonPath: '{.metadata.name}',
        },
    });
    const jobUidOutput = new OutputParameter('job-uid', {
        valueFrom: {
            jsonPath: '{.metadata.uid}',
        },
    });

    const randomNumberJobTemplate = new Template('random-number-job', {
        outputs: new Outputs({
            parameters: [jobNameOutput, jobUidOutput],
        }),
        resource: {
            action: 'create',
            failureCondition: 'status.failed > 0',
            manifest: `apiVersion: batch/v1
kind: Job
metadata:
  generateName: rand-num-
spec:
  completions: 10
  parallelism: 10
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
            successCondition: 'status.succeeded > 9',
        },
    });

    const jobUidInputParameter = new InputParameter('job-uid');

    const printGeneratedNumbersTemplate = new Template('print-generated-numbers', {
        container: new Container({
            args: [
                ` for i in \`kubectl get pods -l controller-uid=${simpleTag(jobUidInputParameter)} -o name\`; do kubectl logs $i; done`,
            ],
            command: ['sh', '-c'],
            image: 'argoproj/argoexec:latest',
        }),
        inputs: new Inputs({
            parameters: [jobUidInputParameter],
        }),
    });

    const jobNameInputParameter = new InputParameter('job-name');

    const deleteJobTemplate = new Template('delete-job', {
        inputs: new Inputs({
            parameters: [jobNameInputParameter],
        }),
        resource: {
            action: 'delete',
            manifest: `apiVersion: batch/v1
kind: Job
metadata:
  name: ${simpleTag(jobNameInputParameter)}
`,
        },
    });

    const randomNumberJobStep = new WorkflowStep('random-number-job', {
        template: randomNumberJobTemplate,
    });

    const k8sOrchestrateTemplate = new Template('k8s-orchestrate', {
        steps: [
            [randomNumberJobStep],
            [
                new WorkflowStep('print-generated-numbers', {
                    arguments: new Arguments({
                        parameters: [
                            jobUidInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: { workflowStep: randomNumberJobStep, output: jobUidOutput },
                            }),
                        ],
                    }),
                    template: printGeneratedNumbersTemplate,
                }),
            ],
            [
                new WorkflowStep('delete-job', {
                    arguments: new Arguments({
                        parameters: [
                            jobNameInputParameter.toArgumentParameter({
                                valueFromExpressionArgs: { workflowStep: randomNumberJobStep, output: jobNameOutput },
                            }),
                        ],
                    }),
                    template: deleteJobTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'k8s-orchestrate-',
        },
        spec: new WorkflowSpec({
            entrypoint: k8sOrchestrateTemplate,
        }),
    }).toWorkflow();
}
