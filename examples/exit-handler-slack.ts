import { Container } from '../src/api/container';
import { Template } from '../src/api/template';
import { Workflow } from '../src/api/workflow';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const sayHelloTemplate = new Template('say-hello', {
        container: new Container({
            args: ['echo hello'],
            command: ['sh', '-c'],
            image: 'alpine:latest',
        }),
    });

    const exitHandlerTemplate = new Template('exit-handler', {
        container: new Container({
            args: [
                `curl -X POST --data-urlencode 'payload={ "text": "{{workflow.name}} finished", "blocks": [ { "type": "section", "text": { "type": "mrkdwn", "text": "Workflow {{workflow.name}} {{workflow.status}}", } } ] }' YOUR_WEBHOOK_URL_HERE`,
            ],
            command: ['sh', '-c'],
            image: 'curlimages/curl',
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'exit-handler-slack-',
        },
        spec: new WorkflowSpec({
            entrypoint: sayHelloTemplate,
            onExit: exitHandlerTemplate,
        }),
    }).toWorkflow();
}
