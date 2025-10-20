import { expect } from 'chai';
import { and, simpleTag, TaskResult, paren, or, hyphenParameter } from '../../src/api/expression';
import { InputParameter, OutputParameter, WorkflowParameter } from '../../src/api/parameter';
import { DagTask } from '../../src/api/dag-task';
import { WorkflowStep } from '../../src/api/workflow-step';
import { InputArtifact, OutputArtifact, OutputResult } from '../../src/api/artifact';

describe('expression tests', (): void => {
    describe('and', (): void => {
        it('returns string with && between values', (): void => {
            const dagTaskA = new DagTask('A', {});
            const dagTaskB = new DagTask('B', {});
            expect(and([dagTaskA, dagTaskB])).to.equal('A && B');
        });
    });

    describe('paren', (): void => {
        it('returns string with () around input', (): void => {
            expect(paren('A')).to.equal('( A )');
        });
    });

    describe('angle', (): void => {
        it('returns string with {{}} around input when input is string', (): void => {
            expect(simpleTag('A')).to.equal('{{A}}');
        });

        it('returns string with {{}} around input when input is parameter', (): void => {
            const inputParameter = new InputParameter('A', {});
            expect(simpleTag(inputParameter)).to.equal('{{inputs.parameters.A}}');
        });

        it('returns string with {{}} around input when input is output parameter and DagTask', (): void => {
            const outputParameter = new OutputParameter('A', {});
            const task = new DagTask('B', {});
            expect(simpleTag({ parameter: outputParameter, task })).to.equal('{{tasks.B.outputs.parameters.A}}');
        });

        it('returns string with {{}} around input when input is output parameter and WorkflowStep', (): void => {
            const outputParameter = new OutputParameter('A', {});
            const task = new WorkflowStep('B', {});
            expect(simpleTag({ parameter: outputParameter, task })).to.equal('{{steps.B.outputs.parameters.A}}');
        });

        it('returns string with {{}} around input when input is workflow parameter', (): void => {
            const workflowParameter = new WorkflowParameter('A', {});
            expect(simpleTag(workflowParameter)).to.equal('{{workflow.parameters.A}}');
        });
    });

    describe('or', (): void => {
        it('returns string with || between values', (): void => {
            const dagTaskA = new DagTask('A', {});
            const dagTaskB = new DagTask('B', {});
            expect(or([dagTaskA, dagTaskB])).to.equal('A || B');
        });
    });

    describe('Complex Constructs', (): void => {
        it('returns value with parens, ands, and ors', (): void => {
            const dagTaskA = new DagTask('A', {});
            const dagTaskB = new DagTask('B', {});
            const dagTaskC = new DagTask('C', {});

            // const templateA = new Template('A', {});
            // // const templateB = new Template('B', {});
            // const templateC = new Template('C', {});

            const result = and([paren(or([dagTaskA, { task: dagTaskB, result: TaskResult.Succeeded }])), dagTaskC]);
            expect(result).to.equal('( A || B.Succeeded ) && C');
        });
    });

    describe('simpleTag', (): void => {
        it('returns artifact input when input type is InputArtifact', (): void => {
            expect(simpleTag(new InputArtifact('A', {}))).to.equal('{{inputs.artifacts.A}}');
        });

        it('returns parameter input when input type is InputParameter', (): void => {
            expect(simpleTag(new InputParameter('A', {}))).to.equal('{{inputs.parameters.A}}');
        });

        it('returns parameter step output when input type is OutputParameter and task is a step', (): void => {
            expect(
                simpleTag({
                    task: new WorkflowStep('StepA', {}),
                    parameter: new OutputParameter('ParamA', {}),
                }),
            ).to.equal('{{steps.StepA.outputs.parameters.ParamA}}');
        });

        it('returns parameter step output when input type is OutputParameter and task is a dag task', (): void => {
            expect(
                simpleTag({
                    task: new DagTask('DagA', {}),
                    parameter: new OutputParameter('ParamA', {}),
                }),
            ).to.equal('{{tasks.DagA.outputs.parameters.ParamA}}');
        });

        it('returns artifact step output when input type is OutputArtifact and task is a step', (): void => {
            expect(
                simpleTag({
                    task: new WorkflowStep('StepA', {}),
                    parameter: new OutputArtifact('ParamA', {}),
                }),
            ).to.equal('{{steps.StepA.outputs.artifacts.ParamA}}');
        });

        it('returns artifact step output when input type is OutputArtifact and task is a dag task', (): void => {
            expect(
                simpleTag({
                    task: new DagTask('DagA', {}),
                    parameter: new OutputArtifact('ParamA', {}),
                }),
            ).to.equal('{{tasks.DagA.outputs.artifacts.ParamA}}');
        });

        it('returns workflow parameter when input type is WorkflowParameter', (): void => {
            expect(simpleTag(new WorkflowParameter('WorkflowParamA'))).to.equal(
                '{{workflow.parameters.WorkflowParamA}}',
            );
        });

        it('returns result step output when input type is OutputResult and task is a step', (): void => {
            expect(
                simpleTag({
                    task: new WorkflowStep('StepA', {}),
                    parameter: new OutputResult(),
                }),
            ).to.equal('{{steps.StepA.outputs.result}}');
        });

        it('returns result step output when input type is OutputResult and task is a dag task', (): void => {
            expect(
                simpleTag({
                    task: new DagTask('DagA', {}),
                    parameter: new OutputResult(),
                }),
            ).to.equal('{{tasks.DagA.outputs.result}}');
        });

        it('returns string input when input type is string', (): void => {
            expect(simpleTag('A')).to.equal('{{A}}');
        });
    });

    describe('hyphenExpression', (): void => {
        it('handles hypenated input artifact ', (): void => {
            expect(hyphenParameter(new InputArtifact('A', {}))).to.equal('inputs.artifacts.A');
        });

        it('handles hypenated input parameter', (): void => {
            expect(hyphenParameter(new InputParameter('A', {}))).to.equal('inputs.parameters.A');
        });

        it('handles hyphen when input type is OutputParameter and task is a step', (): void => {
            expect(
                hyphenParameter({
                    task: new WorkflowStep('Step-A', {}),
                    parameter: new OutputParameter('Param-A', {}),
                }),
            ).to.equal("steps['Step-A'].outputs.parameters['Param-A']");
        });

        it('handles hyphen when input type is OutputArtifact and task is a step', (): void => {
            expect(
                hyphenParameter({
                    task: new WorkflowStep('Step-A', {}),
                    parameter: new OutputArtifact('Param-A', {}),
                }),
            ).to.equal("steps['Step-A'].outputs.artifacts['Param-A']");
        });

        it('rhandles hyphen when input type is OutputParameter and task is a dag task and hypenated', (): void => {
            expect(
                hyphenParameter({
                    task: new DagTask('Dag-A', {}),
                    parameter: new OutputParameter('Param-A', {}),
                }),
            ).to.equal("tasks['Dag-A'].outputs.parameters['Param-A']");
        });

        it('handles hyphen when input type is OutputArtifact and task is a dag task and hypenated', (): void => {
            expect(
                hyphenParameter({
                    task: new DagTask('Dag-A', {}),
                    parameter: new OutputArtifact('Param-A', {}),
                }),
            ).to.equal("tasks['Dag-A'].outputs.artifacts['Param-A']");
        });
    });
});
