import { expect } from 'chai';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { DagTask } from '../../../src/api/dag-task';
import { OutputParameter } from '../../../src/api/parameter';
import { isIn } from '../../../src/api/expressions/membership';
import { jsonPath } from '../../../src/api/expressions/json-path';

describe('membership tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('isIn', (): void => {
        it('returns successfully when inputs are expression args', (): void => {
            const result = isIn(hyphenatedExpressionArgs, jsonPath(expressionArg, '$'));

            expect(result.toString()).to.equal(
                `tasks['A-1'].outputs.parameters['output-1'] in jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$')`,
            );
        });

        it('returns successfully when inputs are undefinedExpression args', (): void => {
            const result = isIn({ string: 'A' }, jsonPath(expressionArg, '$'));

            expect(result.toString()).to.equal(`'A' in jsonpath(tasks['A-1'].outputs.parameters['output-1'], '$')`);
        });
    });
});
