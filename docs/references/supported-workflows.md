# Supported Workflows

Juno supports the following workflows available in Argo Workflows

* `WorkflowTemplate`
* `ClusterWorkflowTemplate`
* `CronWorkflows`

Juno also supports the `Workflow` resource with one caveat. Juno does not currently support running workflows directly from code.

## Architecture
Juno supports a workflow per .ts file pattern. Each workflow must live in its own file. Juno requires each file to have the following method signature
```ts
export async function generateTemplate(): Promise<T> {
    // Template goes here
}
```
Where T is one of the workflow types



# Example Workflows
A hello world example written for each type of workflow

## Workflow
```ts
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': `This is a simple hello world example.\n`,
            },
            generateName: 'hello-world-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
        }),
    }).toWorkflow();
}
```
## Workflow Template
```ts
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1WorkflowTemplate } from '../src/workflow-interfaces/data-contracts';
import { WorkflowTemplate } from '../src/api/workflow-template';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1WorkflowTemplate> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new WorkflowTemplate({
        metadata: {
            name: 'hello-world',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
        }),
    }).toWorkflowTemplate();
}
```



## Cluster Workflow Template
```ts
import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { ClusterWorkflowTemplate } from '../src/api/cluster-workflow-template';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1ClusterWorkflowTemplate } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1ClusterWorkflowTemplate> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new ClusterWorkflowTemplate({
        metadata: {
            name: 'hello-world',
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
        }),
    }).toClusterWorkflowTemplate();
}
```
## Cron Workflow
```ts
import { IoArgoprojWorkflowV1Alpha1CronWorkflow } from '../src/workflow-interfaces/data-contracts';
import { CronWorkflow } from '../src/api/cron-workflow';
import { CronWorkflowSpec } from '../src/api/cron-workflow-spec';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { Template } from '../src/api/template';
import { Container } from '../src/api/container';
import { expressionTag } from '../src/api/expression';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1CronWorkflow> {
    const helloWorld = new Template('hello-world', {
         container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new CronWorkflow({
        metadata: {
            name: 'hello-world-cron',
        },
        spec: new CronWorkflowSpec({
            schedule: '*/2 * * * *', // Run every 2 minutes
            concurrencyPolicy: 'Allow',
            workflowSpec: new WorkflowSpec({
                entrypoint: helloWorld,
            }),
        }),
    }).toCronWorkflowTemplate();
}

```