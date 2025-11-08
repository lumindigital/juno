import { expect } from 'chai';
import { Template } from '../../src/api/template';
import { ArgumentParameter, InputParameter } from '../../src/api/parameter';
import { Script } from '../../src/api/script';
import { EnvironmentVariable } from '../../src/api/environment-variable';
import { Container } from '../../src/api/container';
import { Inputs } from '../../src/api/inputs';
import { DagTemplate } from '../../src/api/dag-template';
import { DagTask } from '../../src/api/dag-task';
import { Arguments } from '../../src/api/arguments';
import { WorkflowStep } from '../../src/api/workflow-step';
import { UserContainer } from '../../src/api/user-container';
import { ContainerSetTemplate } from '../../src/api/container-set-template';
import { ContainerNode } from '../../src/api/container-node';

describe('template validation tests', (): void => {
    describe('script', (): void => {
        it('passes validation when all environment variable inputs are included in input parameters', (): void => {
            const input = new InputParameter('INPUT', {});

            const template = new Template('TEMPLATE', {
                inputs: new Inputs({
                    parameters: [input],
                }),
                script: new Script({
                    env: [
                        new EnvironmentVariable('ENV_VAR', {
                            valueFromInputParameter: input,
                        }),
                    ],
                }),
            });

            expect(() => template.toTemplate()).to.not.throw();
        });

        it('fails validation when environment variable input not included in input parameters', (): void => {
            const missingInput = new InputParameter('MISSING_INPUT', {});

            const template = new Template('TEMPLATE', {
                script: new Script({
                    env: [
                        new EnvironmentVariable('ENV_VAR', {
                            valueFromInputParameter: missingInput,
                        }),
                    ],
                }),
            });

            expect(() => template.toTemplate()).to.throw(
                'Template TEMPLATE references an input parameter MISSING_INPUT in script that is not included in inputs',
            );
        });
    });

    describe('container', (): void => {
        it('passes validation when all environment variable inputs are included in input parameters', (): void => {
            const input = new InputParameter('INPUT', {});

            const template = new Template('TEMPLATE', {
                inputs: new Inputs({
                    parameters: [input],
                }),
                container: new Container({
                    env: [
                        new EnvironmentVariable('ENV_VAR', {
                            valueFromInputParameter: input,
                        }),
                    ],
                }),
            });

            expect(() => template.toTemplate()).to.not.throw();
        });

        it('fails validation when environment variable input not included in input parameters', (): void => {
            const missingInput = new InputParameter('MISSING_INPUT', {});

            const template = new Template('TEMPLATE', {
                container: new Container({
                    env: [
                        new EnvironmentVariable('ENV_VAR', {
                            valueFromInputParameter: missingInput,
                        }),
                    ],
                }),
            });

            expect(() => template.toTemplate()).to.throw(
                'Template TEMPLATE references an input parameter MISSING_INPUT in container that is not included in inputs',
            );
        });
    });

    describe('dag', (): void => {
        it('passes validation when all environment variable inputs are included in input parameters', (): void => {
            const dagTemplate = new Template('DAG_TEMPLATE', {});

            const input = new InputParameter('INPUT', {});

            const template = new Template('TEMPLATE', {
                inputs: new Inputs({
                    parameters: [input],
                }),
                dag: new DagTemplate({
                    tasks: [
                        new DagTask('DAG_TASK', {
                            arguments: new Arguments({
                                parameters: [
                                    new ArgumentParameter('ARG', {
                                        valueFromExpressionArgs: input,
                                    }),
                                ],
                            }),
                            template: dagTemplate,
                        }),
                    ],
                }),
            });

            expect(() => template.toTemplate()).to.not.throw();
        });

        it('fails validation when environment variable input not included in input parameters', (): void => {
            const dagTemplate = new Template('DAG_TEMPLATE', {});
            const missingInput = new InputParameter('MISSING_INPUT', {});
            const template = new Template('TEMPLATE', {
                dag: new DagTemplate({
                    tasks: [
                        new DagTask('DAG_TASK', {
                            arguments: new Arguments({
                                parameters: [
                                    new ArgumentParameter('ARG', {
                                        valueFromExpressionArgs: missingInput,
                                    }),
                                ],
                            }),
                            template: dagTemplate,
                        }),
                    ],
                }),
            });

            expect(() => template.toTemplate()).to.throw(
                'Template TEMPLATE references an input parameter MISSING_INPUT in dag task DAG_TASK that is not included in template inputs',
            );
        });
    });

    describe('step', (): void => {
        it('passes validation when all environment variable inputs are included in input parameters', (): void => {
            const stepTemplate = new Template('STEP_TEMPLATE', {});
            const input = new InputParameter('INPUT', {});
            const template = new Template('TEMPLATE', {
                inputs: new Inputs({
                    parameters: [input],
                }),
                steps: [
                    [
                        new WorkflowStep('DAG_TASK', {
                            arguments: new Arguments({
                                parameters: [
                                    new ArgumentParameter('ARG', {
                                        valueFromExpressionArgs: input,
                                    }),
                                ],
                            }),
                            template: stepTemplate,
                        }),
                    ],
                ],
            });

            expect(() => template.toTemplate()).to.not.throw();
        });

        it('fails validation when environment variable input not included in input parameters', (): void => {
            const stepTemplate = new Template('STEP_TEMPLATE', {});
            const missingInput = new InputParameter('MISSING_INPUT', {});
            const template = new Template('TEMPLATE', {
                steps: [
                    [
                        new WorkflowStep('WORKFLOW_STEP', {
                            arguments: new Arguments({
                                parameters: [
                                    new ArgumentParameter('ARG', {
                                        valueFromExpressionArgs: missingInput,
                                    }),
                                ],
                            }),
                            template: stepTemplate,
                        }),
                    ],
                ],
            });

            expect(() => template.toTemplate()).to.throw(
                'Template TEMPLATE references an input parameter MISSING_INPUT in step WORKFLOW_STEP that is not included in template inputs',
            );
        });
    });

    describe('initContainers', (): void => {
        it('passes validation when all environment variable inputs are included in input parameters', (): void => {
            const input = new InputParameter('INPUT', {});

            const template = new Template('TEMPLATE', {
                inputs: new Inputs({
                    parameters: [input],
                }),
                initContainers: [
                    new UserContainer('init-container', {
                        env: [
                            new EnvironmentVariable('ENV_VAR', {
                                valueFromInputParameter: input,
                            }),
                        ],
                    }),
                ],
            });

            expect(() => template.toTemplate()).to.not.throw();
        });

        it('fails validation when environment variable input not included in input parameters', (): void => {
            const missingInput = new InputParameter('MISSING_INPUT', {});

            const template = new Template('TEMPLATE', {
                initContainers: [
                    new UserContainer('init-container', {
                        env: [
                            new EnvironmentVariable('ENV_VAR', {
                                valueFromInputParameter: missingInput,
                            }),
                        ],
                    }),
                ],
            });

            expect(() => template.toTemplate()).to.throw(
                'Template TEMPLATE references an input parameter MISSING_INPUT in init container init-container that is not included in template inputs',
            );
        });
    });

    describe('sidecars', (): void => {
        it('passes validation when all environment variable inputs are included in input parameters', (): void => {
            const input = new InputParameter('INPUT', {});

            const template = new Template('TEMPLATE', {
                inputs: new Inputs({
                    parameters: [input],
                }),
                sidecars: [
                    new UserContainer('sidecar', {
                        env: [
                            new EnvironmentVariable('ENV_VAR', {
                                valueFromInputParameter: input,
                            }),
                        ],
                    }),
                ],
            });

            expect(() => template.toTemplate()).to.not.throw();
        });

        it('fails validation when environment variable input not included in input parameters', (): void => {
            const missingInput = new InputParameter('MISSING_INPUT', {});

            const template = new Template('TEMPLATE', {
                sidecars: [
                    new UserContainer('SIDECAR', {
                        env: [
                            new EnvironmentVariable('ENV_VAR', {
                                valueFromInputParameter: missingInput,
                            }),
                        ],
                    }),
                ],
            });

            expect(() => template.toTemplate()).to.throw(
                'Template TEMPLATE references an input parameter MISSING_INPUT in sidecar SIDECAR that is not included in template inputs',
            );
        });
    });

    describe('containerSet', (): void => {
        it('passes validation when all environment variable inputs are included in input parameters', (): void => {
            const input = new InputParameter('INPUT', {});

            const template = new Template('TEMPLATE', {
                inputs: new Inputs({
                    parameters: [input],
                }),
                containerSet: new ContainerSetTemplate([
                    new ContainerNode('container1', {
                        env: [
                            new EnvironmentVariable('ENV_VAR', {
                                valueFromInputParameter: input,
                            }),
                        ],
                    }),
                ]),
            });
            expect(() => template.toTemplate()).to.not.throw();
        });

        it('fails validation when environment variable input not included in input parameters', (): void => {
            const missingInput = new InputParameter('MISSING_INPUT', {});

            const template = new Template('TEMPLATE', {
                containerSet: new ContainerSetTemplate([
                    new ContainerNode('container1', {
                        env: [
                            new EnvironmentVariable('ENV_VAR', {
                                valueFromInputParameter: missingInput,
                            }),
                        ],
                    }),
                ]),
            });

            expect(() => template.toTemplate()).to.throw(
                'Template TEMPLATE references an input parameter MISSING_INPUT in containerSet.container container1 that is not included in inputs',
            );
        });
    });
});
