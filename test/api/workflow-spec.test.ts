import { expect } from 'chai';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { Template } from '../../src/api/template';
import { DagTemplate } from '../../src/api/dag-template';
import { DagTask } from '../../src/api/dag-task';
import { WorkflowStep } from '../../src/api/workflow-step';
import { WorkflowTemplate } from '../../src/api/workflow-template';
import { TemplateReference } from '../../src/api/template-reference';
import { Inputs } from '../../src/api/inputs';
import { InputParameter, WorkflowParameter } from '../../src/api/parameter';
import { InputArtifact } from '../../src/api/artifact';
import { Script } from '../../src/api/script';
import { Container } from '../../src/api/container';
import { LifecycleHook } from '../../src/api/lifecycle-hook';
import { TaskResult } from '../../src/api/expression';
import { WorkflowArguments } from '../../src/api/arguments';
import { WorkflowTemplateReference } from '../../src/api/workflow-template-reference';

describe('workflow-spec validation tests', (): void => {
    describe('workflow templates', (): void => {
        it('will not contain duplicate templates', (): void => {
            const templateA = new Template('A', {});

            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [templateA],
                entrypoint: templateA,
            });

            const result = workflowSpec.toWorkflowSpec();

            expect(result.templates).to.have.lengthOf(1);

            expect(result.templates?.[0].name).to.equal('A');
        });

        it('will contain templates nested in steps', (): void => {
            const templateA = new Template('A', {
                steps: [[new WorkflowStep('step1', { template: new Template('B', {}) })]],
            });

            const workflowSpec = new WorkflowSpec({
                entrypoint: templateA,
            });

            const result = workflowSpec.toWorkflowSpec();

            expect(result.templates).to.have.lengthOf(2);
            expect(result.templates?.[0].name).to.equal('A');
            expect(result.templates?.[1].name).to.equal('B');
        });

        it('will contain templates nested in dag tasks', (): void => {
            const templateA = new Template('A', {
                dag: new DagTemplate({
                    tasks: [new DagTask('task1', { template: new Template('B', {}) })],
                }),
            });

            const workflowSpec = new WorkflowSpec({
                entrypoint: templateA,
            });

            const result = workflowSpec.toWorkflowSpec();

            expect(result.templates).to.have.lengthOf(2);
            expect(result.templates?.[0].name).to.equal('A');
            expect(result.templates?.[1].name).to.equal('B');
        });

        it('contains templates nested in onExit dag', (): void => {
            const templateA = new Template('A', {});
            const templateB = new Template('B', {
                dag: new DagTemplate({
                    tasks: [new DagTask('task1', { template: new Template('C', {}) })],
                }),
            });

            const workflowSpec = new WorkflowSpec({
                entrypoint: templateA,
                onExit: templateB,
            });

            const result = workflowSpec.toWorkflowSpec();

            expect(result.templates).to.have.lengthOf(3);
            expect(result.templates?.[0].name).to.equal('A');
            expect(result.templates?.[1].name).to.equal('B');
            expect(result.templates?.[2].name).to.equal('C');
        });

        it('will contain templates nested in onExit step', (): void => {
            const templateA = new Template('A', {});
            const templateB = new Template('B', {
                steps: [[new WorkflowStep('step1', { template: new Template('C', {}) })]],
            });

            const workflowSpec = new WorkflowSpec({
                entrypoint: templateA,
                onExit: templateB,
            });

            const result = workflowSpec.toWorkflowSpec();

            expect(result.templates).to.have.lengthOf(3);
            expect(result.templates?.[0].name).to.equal('A');
            expect(result.templates?.[1].name).to.equal('B');
            expect(result.templates?.[2].name).to.equal('C');
        });

        it('will contain templates nested in lifecycle hooks', (): void => {
            const templateA = new Template('A', {});
            const templateB = new Template('B', {});

            const workflowSpec = new WorkflowSpec({
                entrypoint: templateA,
                hooks: [
                    new LifecycleHook('hook1', {
                        template: templateB,
                    }),
                ],
            });

            const result = workflowSpec.toWorkflowSpec();

            expect(result.templates).to.have.lengthOf(2);

            expect(result.templates?.[0].name).to.equal('A');
            expect(result.templates?.[1].name).to.equal('B');
        });

        it('will not contain templates with the same name', (): void => {
            const templateA = new Template('A', {
                script: new Script({
                    image: 'alpine:latest',
                    command: ['echo', 'Hello World'],
                }),
            });
            const templateB = new Template('A', {
                script: new Script({
                    image: 'alpine:latest',
                    command: ['echo', 'Hello World2'],
                }),
            });
            const entrypoint = new Template('Entrypoint', {
                dag: new DagTemplate({
                    tasks: [
                        new DagTask('task1', { template: templateA }),
                        new DagTask('task2', { template: templateB }),
                    ],
                }),
            });

            const workflowSpec = new WorkflowSpec({
                entrypoint: entrypoint,
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw('Duplicate template names found: A');
        });

        it('will not contain templates when workflowtemplateRef is used', (): void => {
            const template = new Template('A', {});

            const workflowSpec = new WorkflowSpec({
                workflowTemplateRef: new WorkflowTemplateReference({
                    workflowTemplate: new WorkflowTemplate({
                        metadata: { name: 'workflow-template-ref' },
                    }),
                }),
                entrypoint: template,
            });

            const result = workflowSpec.toWorkflowSpec();

            expect(result.templates).to.have.lengthOf(0);
        });
    });

    describe('entrypoint', (): void => {
        it('will fail validation if workflow argument does not exist with same name of input parameter when parameter does not have a value set', (): void => {
            const template = new Template('A', {
                inputs: new Inputs({
                    parameters: [new InputParameter('B', {})],
                }),
            });

            const workflowSpec = new WorkflowSpec({
                arguments: new WorkflowArguments({
                    parameters: [new WorkflowParameter('C', {})],
                }),
                entrypoint: template,
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw('Missing parameter(s) (B) for entrypoint template A');
        });

        it('will pass validation if workflow argument exists with same name of input parameter when parameter does not have a value set', (): void => {
            const template = new Template('A', {
                inputs: new Inputs({
                    parameters: [new InputParameter('B', {})],
                }),
            });

            const workflowSpec = new WorkflowSpec({
                arguments: new WorkflowArguments({
                    parameters: [new WorkflowParameter('B', {})],
                }),
                entrypoint: template,
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
        });
    });

    describe('entrypoint', (): void => {
        it('passes validation when entrypoint template included in templates', (): void => {
            const template = new Template('A', {});

            const workflowSpec = new WorkflowSpec({
                entrypoint: template,
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
        });
    });

    describe('dagTask', (): void => {
        it('fails validation when argument not included in dagtask, and is defined on template as input parameter', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    parameters: [new InputParameter('D', {})],
                }),
            });
            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        dag: new DagTemplate({
                            tasks: [
                                new DagTask('B', {
                                    template: template,
                                }),
                            ],
                        }),
                    }),
                    template,
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'B is missing parameter argument(s) (D) defined on template C',
            );
        });

        it('does not fail validation when argument not included in dagtask, and has a default value on input parameter', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    parameters: [new InputParameter('D', { value: 'default-value' })],
                }),
            });
            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        dag: new DagTemplate({
                            tasks: [
                                new DagTask('B', {
                                    template: template,
                                }),
                            ],
                        }),
                    }),
                    template,
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
        });

        it('fails validation when argument not included in dagtask, and is defined on templateref template as an input parameter', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    parameters: [new InputParameter('D', {})],
                }),
            });

            const templateRefWorkflow = new WorkflowTemplate({
                metadata: {
                    name: 'D',
                },
                spec: new WorkflowSpec({
                    additionalTemplates: [template],
                }),
            });

            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        dag: new DagTemplate({
                            tasks: [
                                new DagTask('B', {
                                    templateRef: new TemplateReference({
                                        template: template,
                                        workflowTemplate: templateRefWorkflow,
                                    }),
                                }),
                            ],
                        }),
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'B references a template named C and is missing parameter argument(s) (D)',
            );
        });

        it('does not fail validation when argument not included in dagtask, and has a default value on templateref template input parameter', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    parameters: [new InputParameter('D', { value: 'default-value' })],
                }),
            });

            const templateRefWorkflow = new WorkflowTemplate({
                metadata: {
                    name: 'D',
                },
                spec: new WorkflowSpec({
                    additionalTemplates: [template],
                }),
            });

            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        dag: new DagTemplate({
                            tasks: [
                                new DagTask('B', {
                                    templateRef: new TemplateReference({
                                        template: template,
                                        workflowTemplate: templateRefWorkflow,
                                    }),
                                }),
                            ],
                        }),
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
        });

        it('fails validation when argument not included in dagtask, and is defined on template as input artifact', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    artifacts: [new InputArtifact('D', {})],
                }),
            });
            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        dag: new DagTemplate({
                            tasks: [
                                new DagTask('B', {
                                    template: template,
                                }),
                            ],
                        }),
                    }),
                    template,
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'B is missing artifact argument(s) (D) defined on template C',
            );
        });

        it('fails validation when argument not included in dagtask, and is defined on templateref template as input artifact', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    artifacts: [new InputArtifact('D', {})],
                }),
            });

            const templateRefWorkflow = new WorkflowTemplate({
                metadata: {
                    name: 'D',
                },
                spec: new WorkflowSpec({
                    additionalTemplates: [template],
                }),
            });

            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        dag: new DagTemplate({
                            tasks: [
                                new DagTask('B', {
                                    templateRef: new TemplateReference({
                                        template: template,
                                        workflowTemplate: templateRefWorkflow,
                                    }),
                                }),
                            ],
                        }),
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'B references a template named C and is missing artifact argument(s) (D)',
            );
        });

        it('fails validation when the depends field includes a dagtask that is not included in template', (): void => {
            const taskA = new DagTask('A', {
                template: new Template('C', {}),
            });

            const taskB = new DagTask('B', {
                depends: taskA,
                template: new Template('C', {}),
            });

            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('D', {
                        dag: new DagTemplate({
                            tasks: [taskB],
                        }),
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'Dependency A in dag task B is not included in template D',
            );
        });

        it('fails validation when the depends field includes a dagtask and result that is not included in template', (): void => {
            const taskA = new DagTask('A', {
                template: new Template('C', {}),
            });

            const taskB = new DagTask('B', {
                depends: { task: taskA, result: TaskResult.Daemoned },
                template: new Template('C', {}),
            });

            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('D', {
                        dag: new DagTemplate({
                            tasks: [taskB],
                        }),
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'Dependency A in dag task B is not included in template D',
            );
        });

        // This should never happen.
        it('fails validation when the depends field includes a workflow step and result that is a workflow step', (): void => {
            const stepA = new WorkflowStep('A', {
                template: new Template('C', {}),
            });

            const taskB = new DagTask('B', {
                depends: { task: stepA, result: TaskResult.Daemoned },
                template: new Template('C', {}),
            });

            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('D', {
                        dag: new DagTemplate({
                            tasks: [taskB],
                        }),
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                `Dependency on ${stepA.name} is not valid in a dag task ${taskB.name} on template D`,
            );
        });

        // This should never happen.
        it('fails validation the depends field includes a workflowstep', (): void => {
            const stepA = new WorkflowStep('A', {
                template: new Template('C', {}),
            });

            const taskB = new DagTask('B', {
                depends: stepA,
                template: new Template('C', {}),
            });

            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('C', {
                        dag: new DagTemplate({
                            tasks: [taskB],
                        }),
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                `Dependency on ${stepA.name} is not valid in a dag task ${taskB.name} on template C`,
            );
        });

        it('fails validation when the dependency field includes a dagtask that is not included in template', (): void => {
            const taskA = new DagTask('A', {
                template: new Template('C', {}),
            });

            const taskB = new DagTask('B', {
                dependencies: [taskA],
                template: new Template('C', {}),
            });

            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('C', {
                        dag: new DagTemplate({
                            tasks: [taskB],
                        }),
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'Dependency A in dag task B is not included in template C',
            );
        });

        it('fails validation when no template or templateRef is specified', (): void => {
            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        dag: new DagTemplate({
                            tasks: [
                                new DagTask('B', {
                                    // No template or templateRef
                                }),
                            ],
                        }),
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'Task B on template A must include either a template, templateRef or inline template',
            );
        });
    });

    describe('workflowStep', (): void => {
        it('fails validation when argument not included in workflowstep, and is defined on template as input parameter', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    parameters: [new InputParameter('D', {})],
                }),
            });
            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        dag: new DagTemplate({
                            tasks: [
                                new DagTask('B', {
                                    template: template,
                                }),
                            ],
                        }),
                    }),
                    template,
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'B is missing parameter argument(s) (D) defined on template C',
            );
        });

        it('fails validation when argument not included in workflowstep, and is defined on templateref as input parameter', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    parameters: [new InputParameter('D', {})],
                }),
            });
            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        steps: [
                            [
                                new WorkflowStep('B', {
                                    template: template,
                                }),
                            ],
                        ],
                    }),
                    template,
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'B is missing parameter argument(s) (D) defined on template C',
            );
        });

        it('fails validation when argument not included in workflowstep, and is defined on template as input artifact', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    artifacts: [new InputArtifact('D', {})],
                }),
            });
            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        dag: new DagTemplate({
                            tasks: [
                                new DagTask('B', {
                                    template: template,
                                }),
                            ],
                        }),
                    }),
                    template,
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'B is missing artifact argument(s) (D) defined on template C',
            );
        });

        it('fails validation when argument not included in workflowstep, and is defined on templateref as input artifact', (): void => {
            const template = new Template('C', {
                inputs: new Inputs({
                    artifacts: [new InputArtifact('D', {})],
                }),
            });
            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        steps: [
                            [
                                new WorkflowStep('B', {
                                    template: template,
                                }),
                            ],
                        ],
                    }),
                    template,
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'B is missing artifact argument(s) (D) defined on template C',
            );
        });

        it('fails validation when no template or templateRef is specified', (): void => {
            const workflowSpec = new WorkflowSpec({
                additionalTemplates: [
                    new Template('A', {
                        steps: [
                            [
                                new WorkflowStep('B', {
                                    // No template or templateRef
                                }),
                            ],
                        ],
                    }),
                ],
            });

            expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                'Step B on template A must include either a template, templateRef or inline template',
            );
        });
    });

    describe('template validation', (): void => {
        describe('script', (): void => {
            it('passes validation when template has volumeMounts and there is a matching workflow volumeClaimTemplate', (): void => {
                const workflowSpec = new WorkflowSpec({
                    additionalTemplates: [
                        new Template('A', {
                            script: new Script({
                                volumeMounts: [
                                    {
                                        name: 'MOUNT',
                                        mountPath: '/mnt/volume',
                                    },
                                ],
                            }),
                        }),
                    ],
                    volumeClaimTemplates: [
                        {
                            metadata: {
                                name: 'MOUNT',
                            },
                        },
                    ],
                });

                expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
            });

            it('passes validation when template has volumeMounts and there is a matching template volume', (): void => {
                const workflowSpec = new WorkflowSpec({
                    additionalTemplates: [
                        new Template('A', {
                            script: new Script({
                                volumeMounts: [
                                    {
                                        name: 'MOUNT',
                                        mountPath: '/mnt/volume',
                                    },
                                ],
                            }),
                            volumes: [
                                {
                                    name: 'MOUNT',
                                },
                            ],
                        }),
                    ],
                });

                expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
            });

            it('passes validation when template has volumeMounts and the name is a simpletag or expression', (): void => {
                const workflowSpec = new WorkflowSpec({
                    additionalTemplates: [
                        new Template('A', {
                            script: new Script({
                                volumeMounts: [
                                    {
                                        name: '{{EXPRESSION}}',
                                        mountPath: '/mnt/volume',
                                    },
                                ],
                            }),
                            volumes: [
                                {
                                    name: 'MOUNT',
                                },
                            ],
                        }),
                    ],
                });

                expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
            });

            it('fails validation when template has volumeMounts and there is no matching workflow volumeClaimTemplate or template volume', (): void => {
                const workflowSpec = new WorkflowSpec({
                    additionalTemplates: [
                        new Template('A', {
                            script: new Script({
                                volumeMounts: [
                                    {
                                        name: 'MISSING_MOUNT',
                                        mountPath: '/mnt/volume',
                                    },
                                ],
                            }),
                        }),
                    ],
                });

                expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                    'Template A has a volumeMount named MISSING_MOUNT in script that references a volume not included in volumeClaimTemplates or template volumes',
                );
            });
        });

        describe('container', (): void => {
            it('passes validation when template has volumeMounts and there is a matching workflow volumeClaimTemplate', (): void => {
                const workflowSpec = new WorkflowSpec({
                    additionalTemplates: [
                        new Template('A', {
                            container: new Container({
                                volumeMounts: [
                                    {
                                        name: 'MOUNT',
                                        mountPath: '/mnt/volume',
                                    },
                                ],
                            }),
                        }),
                    ],
                    volumeClaimTemplates: [
                        {
                            metadata: {
                                name: 'MOUNT',
                            },
                        },
                    ],
                });

                expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
            });

            it('passes validation when template has volumeMounts and there is a matching template volume', (): void => {
                const workflowSpec = new WorkflowSpec({
                    additionalTemplates: [
                        new Template('A', {
                            container: new Container({
                                volumeMounts: [
                                    {
                                        name: 'MOUNT',
                                        mountPath: '/mnt/volume',
                                    },
                                ],
                            }),
                            volumes: [
                                {
                                    name: 'MOUNT',
                                },
                            ],
                        }),
                    ],
                });

                expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
            });

            it('passes validation when template has volumeMounts and the name is a simpletag or expression', (): void => {
                const workflowSpec = new WorkflowSpec({
                    additionalTemplates: [
                        new Template('A', {
                            container: new Container({
                                volumeMounts: [
                                    {
                                        name: '{{EXPRESSION}}',
                                        mountPath: '/mnt/volume',
                                    },
                                ],
                            }),
                            volumes: [
                                {
                                    name: 'MOUNT',
                                },
                            ],
                        }),
                    ],
                });

                expect(() => workflowSpec.toWorkflowSpec()).to.not.throw();
            });

            it('fails validation when template has volumeMounts and there is no matching workflow volumeClaimTemplate or template volume', (): void => {
                const workflowSpec = new WorkflowSpec({
                    additionalTemplates: [
                        new Template('A', {
                            container: new Container({
                                volumeMounts: [
                                    {
                                        name: 'MISSING_MOUNT',
                                        mountPath: '/mnt/volume',
                                    },
                                ],
                            }),
                        }),
                    ],
                });

                expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                    'Template A has a volumeMount named MISSING_MOUNT in a container that references a volume not included in volumeClaimTemplates or template volumes',
                );
            });
        });

        describe('inputs', (): void => {
            it('fails validation when input parameter comes from workflow and parameter not in workflow', (): void => {
                const templateA = new Template('A', {
                    inputs: new Inputs({
                        parameters: [
                            new InputParameter('INPUT', {
                                valueFromExpressionArgs: new WorkflowParameter('MISSING_WORKFLOW_PARAM'),
                            }),
                        ],
                    }),
                });

                const workflowSpec = new WorkflowSpec({
                    additionalTemplates: [templateA],
                    entrypoint: templateA,
                });

                expect(() => workflowSpec.toWorkflowSpec()).to.throw(
                    'Template A references a workflow parameter MISSING_WORKFLOW_PARAM in inputs that is not defined in workflow parameters',
                );
            });
        });
    });
});
