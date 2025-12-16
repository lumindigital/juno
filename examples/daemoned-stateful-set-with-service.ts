import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const createServiceTemplate = new Template('create-service', {
        resource: {
            action: 'create',
            manifest: `apiVersion: v1
kind: Service
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  ports:
    - port: 80
      name: web
  clusterIP: None
  selector:
    app: nginx
`,
        },
    });

    const createStatefulSetTemplate = new Template('create-stateful-set', {
        resource: {
            action: 'create',
            manifest: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  selector:
    matchLabels:
      app: nginx # has to match .spec.template.metadata.labels
  serviceName: "nginx"
  template:
    metadata:
      labels:
        app: nginx # has to match .spec.selector.matchLabels
    spec:
      terminationGracePeriodSeconds: 10
      containers:
        - name: nginx
          image: registry.k8s.io/nginx-slim:0.8
          ports:
            - containerPort: 80
              name: web
`,
        },
    });

    const waitStatefulSetTemplate = new Template('wait-stateful-set', {
        resource: {
            action: 'get',
            manifest: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
`,
            successCondition: 'status.readyReplicas == 1',
        },
    });

    const testTemplate = new Template('test', {
        container: new Container({
            args: ['curl nginx'],
            command: ['sh', '-c'],
            image: 'curlimages/curl:latest',
        }),
    });

    const deleteServiceTemplate = new Template('delete-service', {
        resource: {
            action: 'delete',
            flags: ['--ignore-not-found'],
            manifest: `apiVersion: v1
kind: Service
metadata:
  name: nginx
`,
        },
    });

    const deleteStatefulSetTemplate = new Template('delete-stateful-set', {
        resource: {
            action: 'delete',
            flags: ['--ignore-not-found'],
            manifest: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
`,
        },
    });

    const deleteTemplate = new Template('delete', {
        steps: [
            [
                new WorkflowStep('delete-service', {
                    template: deleteServiceTemplate,
                }),
                new WorkflowStep('delete-stateful-set', {
                    template: deleteStatefulSetTemplate,
                }),
            ],
        ],
    });

    const createWaitAndTestTemplate = new Template('create-wait-and-test', {
        steps: [
            [
                new WorkflowStep('create-service', {
                    template: createServiceTemplate,
                }),
                new WorkflowStep('create-stateful-set', {
                    template: createStatefulSetTemplate,
                }),
            ],
            [
                new WorkflowStep('wait-stateful-set', {
                    template: waitStatefulSetTemplate,
                }),
            ],
            [
                new WorkflowStep('test', {
                    template: testTemplate,
                }),
            ],
        ],
    });

    return new Workflow({
        metadata: {
            generateName: 'daemon-stateful-set-with-service-',
        },
        spec: new WorkflowSpec({
            entrypoint: createWaitAndTestTemplate,
            onExit: deleteTemplate,
        }),
    }).toWorkflow();
}
