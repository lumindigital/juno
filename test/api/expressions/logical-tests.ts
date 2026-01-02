import { expect } from 'chai';
import { and, not, or, paren } from '../../../src/api/expressions/logical';

describe('logical tests', (): void => {
    describe('and', (): void => {
        it('returns successfully', (): void => {
            const result = and([
                { output: 'A', isLogicalExpression: true },
                { output: 'B', isLogicalExpression: true },
                { output: 'C', isLogicalExpression: true },
            ]);
            expect(result.output).to.equal('A && B && C');
        });
    });

    describe('or', (): void => {
        it('returns successfully', (): void => {
            const result = or([
                { output: 'A', isLogicalExpression: true },
                { output: 'B', isLogicalExpression: true },
                { output: 'C', isLogicalExpression: true },
            ]);
            expect(result.output).to.equal('A || B || C');
        });
    });

    describe('not', (): void => {
        it('returns successfully when not a paren', (): void => {
            const result = not({ output: 'A && B', isLogicalExpression: true });
            expect(result.output).to.equal('!( A && B )');
        });

        it('returns successfully when input is a paren', (): void => {
            const result = not({ output: '( A && B )', isParenExpression: true });
            expect(result.output).to.equal('!( A && B )');
        });
    });

    describe('paren', (): void => {
        it('returns successfully', (): void => {
            const result = paren({ output: 'A || B', isLogicalExpression: true });
            expect(result.output).to.equal('( A || B )');
        });
    });
});
