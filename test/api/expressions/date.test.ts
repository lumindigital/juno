import { expect } from 'chai';
import { DagTask } from '../../../src/api/dag-task';
import { date, duration, now, timezone } from '../../../src/api/expressions/date';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('date tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('now', (): void => {
        it('returns successfully with no args', (): void => {
            const result = now();
            expect(result.toString()).to.equal(`now()`);
        });
    });

    describe('duration', (): void => {
        it('returns successfully with string literal', (): void => {
            const result = duration('1h');
            expect(result.toString()).to.equal(`duration('1h')`);
        });

        it('returns successfully with expressionArg', (): void => {
            const result = duration(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`duration(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with string input', (): void => {
            const result = duration({ string: 'myDuration' });
            expect(result.toString()).to.equal(`duration(myDuration)`);
        });
    });

    describe('date', (): void => {
        it('returns successfully with string literal', (): void => {
            const result = date('2024-01-01');
            expect(result.toString()).to.equal(`date('2024-01-01')`);
        });

        it('returns successfully with expressionArg', (): void => {
            const result = date(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`date(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with string input', (): void => {
            const result = date({ string: 'myDate' });
            expect(result.toString()).to.equal(`date(myDate)`);
        });

        it('returns successfully with format', (): void => {
            const result = date('2024-01-01', '2006-01-02');
            expect(result.toString()).to.equal(`date('2024-01-01', '2006-01-02')`);
        });

        it('returns successfully with format and timezone', (): void => {
            const result = date('2024-01-01', '2006-01-02', 'America/New_York');
            expect(result.toString()).to.equal(`date('2024-01-01', '2006-01-02', 'America/New_York')`);
        });
    });

    describe('timezone', (): void => {
        it('returns successfully with string literal', (): void => {
            const result = timezone('America/New_York');
            expect(result.toString()).to.equal(`timezone('America/New_York')`);
        });

        it('returns successfully with expressionArg', (): void => {
            const result = timezone(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`timezone(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with string input', (): void => {
            const result = timezone({ string: 'myTimezone' });
            expect(result.toString()).to.equal(`timezone(myTimezone)`);
        });
    });
});
