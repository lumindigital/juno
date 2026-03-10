import { expect } from 'chai';
import { DagTask } from '../../../src/api/dag-task';
import {
    asFloat,
    asInt,
    asString,
    asType,
    fromBase64,
    fromJson,
    toBase64,
    toJson,
    toPairs,
} from '../../../src/api/expressions/cast';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('cast tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('asInt', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = asInt(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`asInt(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = asInt({ string: '123' });
            expect(result.toString()).to.equal(`asInt(123)`);
        });
    });

    describe('asFloat', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = asFloat(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`asFloat(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = asFloat({ string: '123' });
            expect(result.toString()).to.equal(`asFloat(123)`);
        });
    });

    describe('toJson', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = toJson(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`toJSON(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = toJson({ string: '{}' });
            expect(result.toString()).to.equal(`toJSON({})`);
        });
    });

    describe('asString', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = asString(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`string(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = asString({ string: 'A' });
            expect(result.toString()).to.equal(`string(A)`);
        });
    });

    describe('fromJson', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = fromJson(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`fromJSON(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = fromJson({ string: '{"key": "value"}' });
            expect(result.toString()).to.equal(`fromJSON({"key": "value"})`);
        });
    });

    describe('asType', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = asType(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`type(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = asType({ string: '42' });
            expect(result.toString()).to.equal(`type(42)`);
        });
    });

    describe('toBase64', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = toBase64(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`toBase64(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = toBase64({ string: '"hello"' });
            expect(result.toString()).to.equal(`toBase64("hello")`);
        });
    });

    describe('fromBase64', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = fromBase64(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`fromBase64(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = fromBase64({ string: '"aGVsbG8="' });
            expect(result.toString()).to.equal(`fromBase64("aGVsbG8=")`);
        });
    });

    describe('toPairs', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = toPairs(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`toPairs(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });

        it('returns successfully if string', (): void => {
            const result = toPairs({ string: 'myMap' });
            expect(result.toString()).to.equal(`toPairs(myMap)`);
        });
    });
});
