import { expect } from 'chai';
import { DagTask } from '../../../src/api/dag-task';
import { asInt } from '../../../src/api/expressions/cast';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';
import { add, divide, exponent, modulus, multiply, subtract } from '../../../src/api/expressions/arithmetic';

describe('arithmetic tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('add', (): void => {
        it('returns successfully when using hyphenated expression args and a number', (): void => {
            const result = add(asInt(hyphenatedExpressionArgs), 10);
            expect(result.toString()).to.equal(`asInt(tasks['A-1'].outputs.parameters['output-1']) + 10`);
        });

        it('returns successfully when using hyphenated expression args', (): void => {
            const result = add(asInt(hyphenatedExpressionArgs), asInt(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(
                `asInt(tasks['A-1'].outputs.parameters['output-1']) + asInt(tasks['A-1'].outputs.parameters['output-1'])`,
            );
        });
    });

    describe('subtract', (): void => {
        it('returns successfully when using hyphenated expression args and a number', (): void => {
            const result = subtract(asInt(hyphenatedExpressionArgs), 10);
            expect(result.toString()).to.equal(`asInt(tasks['A-1'].outputs.parameters['output-1']) - 10`);
        });

        it('returns successfully when using hyphenated expression args', (): void => {
            const result = subtract(asInt(hyphenatedExpressionArgs), asInt(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(
                `asInt(tasks['A-1'].outputs.parameters['output-1']) - asInt(tasks['A-1'].outputs.parameters['output-1'])`,
            );
        });
    });

    describe('multiply', (): void => {
        it('returns successfully when using hyphenated expression args and a number', (): void => {
            const result = multiply(asInt(hyphenatedExpressionArgs), 10);
            expect(result.toString()).to.equal(`asInt(tasks['A-1'].outputs.parameters['output-1']) * 10`);
        });

        it('returns successfully when using hyphenated expression args', (): void => {
            const result = multiply(asInt(hyphenatedExpressionArgs), asInt(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(
                `asInt(tasks['A-1'].outputs.parameters['output-1']) * asInt(tasks['A-1'].outputs.parameters['output-1'])`,
            );
        });
    });

    describe('divide', (): void => {
        it('returns successfully when using hyphenated expression args and a number', (): void => {
            const result = divide(asInt(hyphenatedExpressionArgs), 10);
            expect(result.toString()).to.equal(`asInt(tasks['A-1'].outputs.parameters['output-1']) / 10`);
        });

        it('returns successfully when using hyphenated expression args', (): void => {
            const result = divide(asInt(hyphenatedExpressionArgs), asInt(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(
                `asInt(tasks['A-1'].outputs.parameters['output-1']) / asInt(tasks['A-1'].outputs.parameters['output-1'])`,
            );
        });
    });

    describe('modulus', (): void => {
        it('returns successfully when using hyphenated expression args and a number', (): void => {
            const result = modulus(asInt(hyphenatedExpressionArgs), 10);
            expect(result.toString()).to.equal(`asInt(tasks['A-1'].outputs.parameters['output-1']) % 10`);
        });

        it('returns successfully when using hyphenated expression args', (): void => {
            const result = modulus(asInt(hyphenatedExpressionArgs), asInt(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(
                `asInt(tasks['A-1'].outputs.parameters['output-1']) % asInt(tasks['A-1'].outputs.parameters['output-1'])`,
            );
        });
    });

    describe('exponent', (): void => {
        it('returns successfully when using hyphenated expression args and a number', (): void => {
            const result = exponent(asInt(hyphenatedExpressionArgs), 10);
            expect(result.toString()).to.equal(`asInt(tasks['A-1'].outputs.parameters['output-1']) ** 10`);
        });

        it('returns successfully when using hyphenated expression args', (): void => {
            const result = exponent(asInt(hyphenatedExpressionArgs), asInt(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(
                `asInt(tasks['A-1'].outputs.parameters['output-1']) ** asInt(tasks['A-1'].outputs.parameters['output-1'])`,
            );
        });
    });
});
