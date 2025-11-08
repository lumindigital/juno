import { expect } from 'chai';
import {
    and,
    getVariableReference,
    TaskResult,
    paren,
    or,
    hyphenParameter,
    simpleTag,
    not,
} from '../../src/api/expression';
import { FromItemProperty, InputParameter, OutputParameter, WorkflowParameter } from '../../src/api/parameter';
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

    describe('simpleTag', (): void => {
        it('returns string with {{}} around input', (): void => {
            expect(simpleTag('A')).to.equal('{{A}}');
        });
    });

    describe('not', (): void => {
        it('returns string with ! before value', (): void => {
            const dagTaskA = new DagTask('A', {});
            expect(`${not(dagTaskA)}`).to.equal('!A');
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

    describe('getVariableReference', (): void => {
        it('returns artifact input when input type is InputArtifact', (): void => {
            expect(getVariableReference(new InputArtifact('A', {}))).to.equal('inputs.artifacts.A');
        });

        it('returns parameter input when input type is InputParameter', (): void => {
            expect(getVariableReference(new InputParameter('A', {}))).to.equal('inputs.parameters.A');
        });

        it('returns parameter step output when input type is OutputParameter and task is a step', (): void => {
            expect(
                getVariableReference({
                    workflowStep: new WorkflowStep('StepA', {}),
                    output: new OutputParameter('ParamA', {}),
                }),
            ).to.equal('steps.StepA.outputs.parameters.ParamA');
        });

        it('returns parameter step output when input type is OutputParameter and task is a dag task', (): void => {
            expect(
                getVariableReference({
                    dagTask: new DagTask('DagA', {}),
                    output: new OutputParameter('ParamA', {}),
                }),
            ).to.equal('tasks.DagA.outputs.parameters.ParamA');
        });

        it('returns artifact step output when input type is OutputArtifact and task is a step', (): void => {
            expect(
                getVariableReference({
                    workflowStep: new WorkflowStep('StepA', {}),
                    output: new OutputArtifact('ParamA', {}),
                }),
            ).to.equal('steps.StepA.outputs.artifacts.ParamA');
        });

        it('returns artifact step output when input type is OutputArtifact and task is a dag task', (): void => {
            expect(
                getVariableReference({
                    dagTask: new DagTask('DagA', {}),
                    output: new OutputArtifact('ParamA', {}),
                }),
            ).to.equal('tasks.DagA.outputs.artifacts.ParamA');
        });

        it('returns workflow parameter when input type is WorkflowParameter', (): void => {
            expect(getVariableReference(new WorkflowParameter('WorkflowParamA'))).to.equal(
                'workflow.parameters.WorkflowParamA',
            );
        });

        it('returns result step output when input type is OutputResult and task is a step', (): void => {
            expect(
                getVariableReference({
                    workflowStep: new WorkflowStep('StepA', {}),
                    output: new OutputResult(),
                }),
            ).to.equal('steps.StepA.outputs.result');
        });

        it('returns result step output when input type is OutputResult and task is a dag task', (): void => {
            expect(
                getVariableReference({
                    dagTask: new DagTask('DagA', {}),
                    output: new OutputResult(),
                }),
            ).to.equal('tasks.DagA.outputs.result');
        });

        it('returns string input when input type is string', (): void => {
            expect(getVariableReference('A')).to.equal('A');
        });

        it('returns output parameter path when input type is pathresult', (): void => {
            expect(
                getVariableReference({
                    pathResult: new OutputParameter('ParamA', {}),
                }),
            ).to.equal('outputs.parameters.ParamA.path');
        });

        it('returns output artifact path when input type is pathresult', (): void => {
            expect(
                getVariableReference({
                    pathResult: new OutputArtifact('OutputA', {}),
                }),
            ).to.equal('outputs.artifacts.OutputA.path');
        });

        it('returns input artifact path when input type is InputArtifact and Self()', (): void => {
            expect(
                getVariableReference({
                    pathResult: new InputArtifact('InputA', {}),
                }),
            ).to.equal('inputs.artifacts.InputA.path');
        });

        it('returns workflow output artifiact when type is WorkflowOutputParameter', (): void => {
            expect(
                getVariableReference({
                    workflowOutput: new OutputArtifact('OutputA', { globalName: 'GlobalOutputA' }),
                }),
            ).to.equal('workflow.outputs.artifacts.GlobalOutputA');
        });

        it('returns workflow output parameter when type is WorkflowOutputParameter', (): void => {
            expect(
                getVariableReference({
                    workflowOutput: new OutputParameter('OutputA', { globalName: 'GlobalOutputA' }),
                }),
            ).to.equal('workflow.outputs.parameters.GlobalOutputA');
        });

        it('returns item.key when type is FromItemProperty', (): void => {
            expect(getVariableReference(new FromItemProperty('KeyA'))).to.equal('item.KeyA');
        });

        it('returns item when type is FromItemProperty key is not defined', (): void => {
            expect(getVariableReference(new FromItemProperty())).to.equal('item');
        });

        it('returns task and result when type is TaskAndResult and both task and result are defined', (): void => {
            expect(getVariableReference({ task: new DagTask('TaskA', {}), result: TaskResult.Failed })).to.equal(
                'TaskA.Failed',
            );
        });

        it('returns task only when type is TaskAndResult and only task is defined', (): void => {
            expect(getVariableReference({ task: new DagTask('TaskA', {}), result: undefined })).to.equal('TaskA');
        });

        it('returns task and string when type is StepOutputString and both step and string are defined', (): void => {
            expect(getVariableReference({ workflowStep: new WorkflowStep('StepA', {}), output: 'myString' })).to.equal(
                'steps.StepA.myString',
            );
        });

        it('returns task and string when type is TaskOutputString and both task and string are defined', (): void => {
            expect(getVariableReference({ dagTask: new DagTask('DagA', {}), output: 'myString' })).to.equal(
                'tasks.DagA.myString',
            );
        });

        it('returns valid reference when type is StringStepOutputString', (): void => {
            expect(
                getVariableReference({
                    workflowStepName: 'StepA',
                    output: 'value',
                }),
            ).to.equal('steps.StepA.value');
        });

        it('returns valid reference when type is StringTaskOutputString', (): void => {
            expect(
                getVariableReference({
                    dagTaskName: 'DagA',
                    output: 'value',
                }),
            ).to.equal('tasks.DagA.value');
        });

        it('returns valid reference when type is StringStepOutputParameter', (): void => {
            expect(
                getVariableReference({
                    workflowStepName: 'StepA',
                    output: new OutputParameter('ParamA', {}),
                }),
            ).to.equal('steps.StepA.outputs.parameters.ParamA');
        });

        it('returns valid reference when type is StringTaskOutputParameter', (): void => {
            expect(
                getVariableReference({
                    workflowStepName: 'StepA',
                    output: new OutputParameter('ParamA', {}),
                }),
            ).to.equal('steps.StepA.outputs.parameters.ParamA');
        });

        it('returns valid reference when type is StringStepOutputArtifact', (): void => {
            expect(
                getVariableReference({
                    workflowStepName: 'StepA',
                    output: new OutputArtifact('ArtifactA', {}),
                }),
            ).to.equal('steps.StepA.outputs.artifacts.ArtifactA');
        });

        it('returns valid reference when type is StringTaskOutputArtifact', (): void => {
            expect(
                getVariableReference({
                    dagTaskName: 'TaskA',
                    output: new OutputArtifact('ArtifactA', {}),
                }),
            ).to.equal('tasks.TaskA.outputs.artifacts.ArtifactA');
        });

        it('returns valid reference when type is StringStepOutputResult', (): void => {
            expect(
                getVariableReference({
                    workflowStepName: 'StepA',
                    output: new OutputResult(),
                }),
            ).to.equal('steps.StepA.outputs.result');
        });

        it('returns valid reference when type is StringTaskOutputResult', (): void => {
            expect(
                getVariableReference({
                    dagTaskName: 'TaskA',
                    output: new OutputResult(),
                }),
            ).to.equal('tasks.TaskA.outputs.result');
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
                    workflowStep: new WorkflowStep('Step-A', {}),
                    output: new OutputParameter('Param-A', {}),
                }),
            ).to.equal("steps['Step-A'].outputs.parameters['Param-A']");
        });

        it('handles hyphen when input type is OutputArtifact and task is a step', (): void => {
            expect(
                hyphenParameter({
                    workflowStep: new WorkflowStep('Step-A', {}),
                    output: new OutputArtifact('Param-A', {}),
                }),
            ).to.equal("steps['Step-A'].outputs.artifacts['Param-A']");
        });

        it('handles hyphen when input type is OutputParameter and task is a dag task and hypenated', (): void => {
            expect(
                hyphenParameter({
                    dagTask: new DagTask('Dag-A', {}),
                    output: new OutputParameter('Param-A', {}),
                }),
            ).to.equal("tasks['Dag-A'].outputs.parameters['Param-A']");
        });

        it('handles hyphen when input type is OutputArtifact and task is a dag task and hypenated', (): void => {
            expect(
                hyphenParameter({
                    dagTask: new DagTask('Dag-A', {}),
                    output: new OutputArtifact('Param-A', {}),
                }),
            ).to.equal("tasks['Dag-A'].outputs.artifacts['Param-A']");
        });
    });
});
