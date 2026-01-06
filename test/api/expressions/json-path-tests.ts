import { expect } from 'chai';
import { jsonPath } from '../../../src/api/expressions/json-path';
import { DagTask } from '../../../src/api/dag-task';
import { OutputParameter } from '../../../src/api/parameter';

describe('jsonPath tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };

    describe('jsonPath', (): void => {
        it('returns successfully', (): void => {
            const result = jsonPath(expressionArg, '$[0].value');

            expect(result.toString()).to.equal(`jsonpath(tasks.A-1.outputs.parameters.output-1, '$[0].value')`);
        });
    });
});
