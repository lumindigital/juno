import { expect } from 'chai';
import { InputParameter } from '../../src/api/parameter.js';
import { DagTask } from '../../src/api/dag-task.js';

describe('parameter validation tests', (): void => {
    it('passes validation when expression args are used', (): void => {
        const input = new InputParameter('INPUT', {
            valueFromExpressionArgs: { dagTask: new DagTask('A', {}), output: 'someOutput' },
        });

        expect(() => input.toParameter()).to.not.throw();
    });
});
