import { expect } from 'chai';
import { expressionTag, simpleTag } from '../../../src/api/expressions/tag';
import { LogicalExpression } from '../../../src/api/expressions/classes';

describe('tag tests', (): void => {
    const logicalExpression = new LogicalExpression('A + B');
    const stringArg = { string: 'A' };

    describe('expressionTag', (): void => {
        it('returns successfully', (): void => {
            const result = expressionTag(logicalExpression);

            expect(result.toString()).to.equal('{{=A + B}}');
        });

        it('returns successfully with string interpolation', (): void => {
            const result = expressionTag(logicalExpression);

            expect(`${result}`).to.equal('{{=A + B}}');
        });
    });

    describe('simpleTag', (): void => {
        it('returns successfully', (): void => {
            const result = simpleTag(stringArg);

            expect(result.toString()).to.equal('{{A}}');
        });

        it('returns successfully with string interpolation', (): void => {
            const result = simpleTag(stringArg);

            expect(`${result}`).to.equal('{{A}}');
        });
    });
});
