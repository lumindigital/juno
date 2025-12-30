import { Arguments } from '../src/api/arguments';
import { Container } from '../src/api/container';
import { DagTask } from '../src/api/dag-task';
import { DagTemplate } from '../src/api/dag-template';
import { and } from '../src/api/expr-api';
import { simpleTag } from '../src/api/expression';
import { Inputs } from '../src/api/inputs';
import { InputParameter } from '../src/api/parameter';
import { Template } from '../src/api/template';
import { TemplateReference } from '../src/api/template-reference';
import { WorkflowSpec } from '../src/api/workflow-spec';
import { WorkflowStep } from '../src/api/workflow-step';
import { WorkflowTemplate } from '../src/api/workflow-template';

export class SharedTemplates {
    static messageInputParameter = new InputParameter('message');

    public static printMessageTemplate = new Template('print-message', {
        inputs: new Inputs({
            parameters: [this.messageInputParameter],
        }),
        container: new Container({
            image: 'busybox',
            command: ['echo'],
            args: [simpleTag(this.messageInputParameter)],
        }),
    });

    public static printMessageWorkflowTemplate = new WorkflowTemplate({
        metadata: {
            name: 'workflow-template-print-message',
        },
        spec: new WorkflowSpec({
            entrypoint: this.printMessageTemplate,
        }),
    });

    public static randomFailTemplate = new Template('random-fail-template', {
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

    public static innerHello1Template = new WorkflowStep('inner-hello1', {
        templateRef: new TemplateReference({
            workflowTemplate: this.printMessageWorkflowTemplate,
            template: this.printMessageTemplate,
        }),
        arguments: new Arguments({
            parameters: [this.messageInputParameter.toArgumentParameter({ value: 'inner-hello1' })],
        }),
    });
    public static innerHello2aTemplate = new WorkflowStep('inner-hello2a', {
        templateRef: new TemplateReference({
            workflowTemplate: this.printMessageWorkflowTemplate,
            template: this.printMessageTemplate,
        }),
        arguments: new Arguments({
            parameters: [this.messageInputParameter.toArgumentParameter({ value: 'inner-hello2a' })],
        }),
    });
    public static innerHello2bTemplate = new WorkflowStep('inner-hello2b', {
        templateRef: new TemplateReference({
            template: this.printMessageTemplate,
        }),
        arguments: new Arguments({
            parameters: [this.messageInputParameter.toArgumentParameter({ value: 'inner-hello2b' })],
        }),
    });

    public static innerStepsTemplate = new Template('inner-steps', {
        steps: [[this.innerHello1Template], [this.innerHello2aTemplate, this.innerHello2bTemplate]],
    });

    public static innerADagTask = new DagTask('inner-A', {
        templateRef: new TemplateReference({
            workflowTemplate: this.printMessageWorkflowTemplate,
            template: this.printMessageTemplate,
        }),
        arguments: new Arguments({
            parameters: [this.messageInputParameter.toArgumentParameter({ value: 'inner-A' })],
        }),
    });
    public static innerBDagTask = new DagTask('inner-B', {
        depends: this.innerADagTask,
        template: this.printMessageTemplate,
        arguments: new Arguments({
            parameters: [this.messageInputParameter.toArgumentParameter({ value: 'inner-B' })],
        }),
    });
    public static innerCDagTask = new DagTask('inner-C', {
        depends: this.innerADagTask,
        template: this.printMessageTemplate,
        arguments: new Arguments({
            parameters: [this.messageInputParameter.toArgumentParameter({ value: 'inner-C' })],
        }),
    });
    public static innerDDagTask = new DagTask('inner-D', {
        depends: and([this.innerBDagTask, this.innerCDagTask]),
        templateRef: new TemplateReference({
            workflowTemplate: this.printMessageWorkflowTemplate,
            template: this.printMessageTemplate,
        }),
        arguments: new Arguments({
            parameters: [this.messageInputParameter.toArgumentParameter({ value: 'inner-D' })],
        }),
    });

    public static innerDiamondTemplate = new Template('inner-diamond', {
        dag: new DagTemplate({
            tasks: [this.innerADagTask, this.innerBDagTask, this.innerCDagTask, this.innerDDagTask],
        }),
    });
}
