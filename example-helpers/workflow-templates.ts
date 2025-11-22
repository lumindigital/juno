import { Arguments, WorkflowArguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { and, simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { TemplateReference } from '../src/api/template-reference';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { WorkflowTemplate } from '../src/api/workflow-template';

// Templates here differ slightly from the examples in the argo project. Juno requires an entrypoint template to be specified.
// The preferred way to use Juno templates is to not use template references.
// If you were going to use template references, a better practice would be to just stub out the template and workflow template.
const messageInputParameter = new InputParameter('message');

export const printMessageTemplate = new Template('print-message', {
    inputs: new Inputs({
        parameters: [messageInputParameter],
    }),
    container: new Container({
        image: 'busybox',
        command: ['echo'],
        args: [simpleTag(messageInputParameter)],
    }),
});

export const printMessageWorkflowTemplate = new WorkflowTemplate({
    metadata: {
        name: 'workflow-template-print-message',
    },
    spec: new WorkflowSpec({
        entrypoint: printMessageTemplate,
    }),
});

export const randomFailTemplate = new Template('random-fail-template', {
    retryStrategy: {
        limit: '10',
    },
    container: new Container({
        image: 'python:alpine3.6',
        command: ['python', '-c'],
        // fail with a 66% probability
        args: ['import random; import sys; exit_code = random.choice([0, 1, 1]); sys.exit(exit_code)'],
    }),
});

export const workflowTemplateRandomFail = new WorkflowTemplate({
    metadata: {
        name: 'workflow-template-random-fail-template',
    },
    spec: new WorkflowSpec({
        entrypoint: randomFailTemplate,
    }),
});

const innerHello1Template = new WorkflowStep('inner-hello1', {
    templateRef: new TemplateReference({
        workflowTemplate: printMessageWorkflowTemplate,
        template: printMessageTemplate,
    }),
    arguments: new Arguments({
        parameters: [messageInputParameter.toArgumentParameter({ value: 'inner-hello1' })],
    }),
});
const innerHello2aTemplate = new WorkflowStep('inner-hello2a', {
    templateRef: new TemplateReference({
        workflowTemplate: printMessageWorkflowTemplate,
        template: printMessageTemplate,
    }),
    arguments: new Arguments({
        parameters: [messageInputParameter.toArgumentParameter({ value: 'inner-hello2a' })],
    }),
});
const innerHello2bTemplate = new WorkflowStep('inner-hello2b', {
    templateRef: new TemplateReference({
        template: printMessageTemplate,
    }),
    arguments: new Arguments({
        parameters: [messageInputParameter.toArgumentParameter({ value: 'inner-hello2b' })],
    }),
});

export const innerStepsTemplate = new Template('inner-steps', {
    steps: [[innerHello1Template], [innerHello2aTemplate, innerHello2bTemplate]],
});

export const innerStepsWorkflowTemplate = new WorkflowTemplate({
    metadata: {
        name: 'workflow-template-inner-steps',
    },
    spec: new WorkflowSpec({
        entrypoint: innerStepsTemplate,
    }),
});

const innerADagTask = new DagTask('inner-A', {
    templateRef: new TemplateReference({
        workflowTemplate: printMessageWorkflowTemplate,
        template: printMessageTemplate,
    }),
    arguments: new Arguments({
        parameters: [messageInputParameter.toArgumentParameter({ value: 'inner-A' })],
    }),
});
const innerBDagTask = new DagTask('inner-B', {
    depends: innerADagTask,
    template: printMessageTemplate,
    arguments: new Arguments({
        parameters: [messageInputParameter.toArgumentParameter({ value: 'inner-B' })],
    }),
});
const innerCDagTask = new DagTask('inner-C', {
    depends: innerADagTask,
    template: printMessageTemplate,
    arguments: new Arguments({
        parameters: [messageInputParameter.toArgumentParameter({ value: 'inner-C' })],
    }),
});
const innerDDagTask = new DagTask('inner-D', {
    depends: and([innerBDagTask, innerCDagTask]),
    templateRef: new TemplateReference({
        workflowTemplate: printMessageWorkflowTemplate,
        template: printMessageTemplate,
    }),
    arguments: new Arguments({
        parameters: [messageInputParameter.toArgumentParameter({ value: 'inner-D' })],
    }),
});

export const innerDiamondTemplate = new Template('inner-diamond', {
    dag: new DagTemplate({
        tasks: [innerADagTask, innerBDagTask, innerCDagTask, innerDDagTask],
    }),
});

export const innerDagWorkflowTemplate = new WorkflowTemplate({
    metadata: {
        name: 'workflow-template-inner-dag',
    },
    spec: new WorkflowSpec({
        entrypoint: innerDiamondTemplate,
    }),
});

export const submittableWorkflowTemplate = new WorkflowTemplate({
    metadata: {
        name: 'workflow-template-submittable',
    },
    spec: new WorkflowSpec({
        entrypoint: printMessageTemplate,
        arguments: new WorkflowArguments({
            parameters: [messageInputParameter.toWorkflowParameter({ value: 'hello world' })],
        }),
    }),
});
