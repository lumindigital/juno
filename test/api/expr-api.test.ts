import { expect } from 'chai';
import { TaskResult } from '../../src/api/expression';
import { and, or, paren, not } from '../../src/api/expr-api';
import { DagTask } from '../../src/api/dag-task';

describe('expr api tests', (): void => {
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

            const result = and([paren(or([dagTaskA, { task: dagTaskB, result: TaskResult.Succeeded }])), dagTaskC]);
            expect(result).to.equal('( A || B.Succeeded ) && C');
        });
    });
});
