import { expect } from 'chai';

import { DagTask } from '../../../src/api/dag-task';
import { fromJson } from '../../../src/api/expressions/cast';
import {
    all,
    any,
    arrayConcat,
    arrayMap,
    count,
    filter,
    find,
    findIndex,
    findLast,
    findLastIndex,
    first,
    flatten,
    groupBy,
    join,
    last,
    mean,
    median,
    none,
    one,
    reduce,
    reverse,
    sort,
    sortBy,
    sum,
    take,
    uniq,
} from '../../../src/api/expressions/array';
import { hyphenateExpressionArgs } from '../../../src/api/expressions/tag';
import { OutputParameter } from '../../../src/api/parameter';

describe('array tests', (): void => {
    const expressionArg = { dagTask: new DagTask('A-1', {}), output: new OutputParameter('output-1') };
    const hyphenatedExpressionArgs = hyphenateExpressionArgs(expressionArg);

    describe('first', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = first(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`first(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = first({ string: 'myArray' });
            expect(result.toString()).to.equal(`first(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = first(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`first(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('last', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = last(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`last(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = last({ string: 'myArray' });
            expect(result.toString()).to.equal(`last(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = last(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`last(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('flatten', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = flatten(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`flatten(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = flatten({ string: 'myArray' });
            expect(result.toString()).to.equal(`flatten(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = flatten(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`flatten(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('reverse', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = reverse(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`reverse(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = reverse({ string: 'myArray' });
            expect(result.toString()).to.equal(`reverse(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = reverse(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`reverse(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('sort', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = sort(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`sort(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = sort({ string: 'myArray' });
            expect(result.toString()).to.equal(`sort(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = sort(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`sort(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('uniq', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = uniq(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`uniq(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = uniq({ string: 'myArray' });
            expect(result.toString()).to.equal(`uniq(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = uniq(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`uniq(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('join', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = join(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`join(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = join({ string: 'myArray' });
            expect(result.toString()).to.equal(`join(myArray)`);
        });

        it('returns successfully with delimiter', (): void => {
            const result = join(hyphenatedExpressionArgs, ', ');
            expect(result.toString()).to.equal(`join(tasks['A-1'].outputs.parameters['output-1'], ', ')`);
        });

        it('returns successfully if fromJson expression with delimiter', (): void => {
            const result = join(fromJson(hyphenatedExpressionArgs), '-');
            expect(result.toString()).to.equal(`join(fromJSON(tasks['A-1'].outputs.parameters['output-1']), '-')`);
        });
    });

    describe('arrayConcat', (): void => {
        it('returns successfully with two expressionArgs', (): void => {
            const expressionArg2 = {
                dagTask: new DagTask('B-1', {}),
                output: new OutputParameter('output-2'),
            };
            const hyphenatedExpressionArgs2 = hyphenateExpressionArgs(expressionArg2);
            const result = arrayConcat(hyphenatedExpressionArgs, hyphenatedExpressionArgs2);
            expect(result.toString()).to.equal(
                `concat(tasks['A-1'].outputs.parameters['output-1'], tasks['B-1'].outputs.parameters['output-2'])`,
            );
        });

        it('returns successfully with string inputs', (): void => {
            const result = arrayConcat({ string: 'array1' }, { string: 'array2' });
            expect(result.toString()).to.equal(`concat(array1, array2)`);
        });

        it('returns successfully with fromJson expressions', (): void => {
            const result = arrayConcat(fromJson(hyphenatedExpressionArgs), fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(
                `concat(fromJSON(tasks['A-1'].outputs.parameters['output-1']), fromJSON(tasks['A-1'].outputs.parameters['output-1']))`,
            );
        });
    });

    describe('mean', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = mean(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`mean(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = mean({ string: 'myArray' });
            expect(result.toString()).to.equal(`mean(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = mean(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`mean(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('median', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = median(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`median(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully if string', (): void => {
            const result = median({ string: 'myArray' });
            expect(result.toString()).to.equal(`median(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = median(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`median(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('take', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = take(hyphenatedExpressionArgs, 3);
            expect(result.toString()).to.equal(`take(tasks['A-1'].outputs.parameters['output-1'], 3)`);
        });

        it('returns successfully if string', (): void => {
            const result = take({ string: 'myArray' }, 5);
            expect(result.toString()).to.equal(`take(myArray, 5)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = take(fromJson(hyphenatedExpressionArgs), 2);
            expect(result.toString()).to.equal(`take(fromJSON(tasks['A-1'].outputs.parameters['output-1']), 2)`);
        });
    });

    describe('all', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = all(hyphenatedExpressionArgs, '{# > 0}');
            expect(result.toString()).to.equal(`all(tasks['A-1'].outputs.parameters['output-1'], {# > 0})`);
        });

        it('returns successfully if string', (): void => {
            const result = all({ string: 'myArray' }, '{# > 0}');
            expect(result.toString()).to.equal(`all(myArray, {# > 0})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = all(fromJson(hyphenatedExpressionArgs), '{# > 0}');
            expect(result.toString()).to.equal(`all(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# > 0})`);
        });
    });

    describe('any', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = any(hyphenatedExpressionArgs, '{# > 2}');
            expect(result.toString()).to.equal(`any(tasks['A-1'].outputs.parameters['output-1'], {# > 2})`);
        });

        it('returns successfully if string', (): void => {
            const result = any({ string: 'myArray' }, '{# > 2}');
            expect(result.toString()).to.equal(`any(myArray, {# > 2})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = any(fromJson(hyphenatedExpressionArgs), '{# > 2}');
            expect(result.toString()).to.equal(`any(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# > 2})`);
        });
    });

    describe('one', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = one(hyphenatedExpressionArgs, '{# == 3}');
            expect(result.toString()).to.equal(`one(tasks['A-1'].outputs.parameters['output-1'], {# == 3})`);
        });

        it('returns successfully if string', (): void => {
            const result = one({ string: 'myArray' }, '{# == 3}');
            expect(result.toString()).to.equal(`one(myArray, {# == 3})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = one(fromJson(hyphenatedExpressionArgs), '{# == 3}');
            expect(result.toString()).to.equal(`one(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# == 3})`);
        });
    });

    describe('none', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = none(hyphenatedExpressionArgs, '{# < 0}');
            expect(result.toString()).to.equal(`none(tasks['A-1'].outputs.parameters['output-1'], {# < 0})`);
        });

        it('returns successfully if string', (): void => {
            const result = none({ string: 'myArray' }, '{# < 0}');
            expect(result.toString()).to.equal(`none(myArray, {# < 0})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = none(fromJson(hyphenatedExpressionArgs), '{# < 0}');
            expect(result.toString()).to.equal(`none(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# < 0})`);
        });
    });

    describe('arrayMap', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = arrayMap(hyphenatedExpressionArgs, '{# * 2}');
            expect(result.toString()).to.equal(`map(tasks['A-1'].outputs.parameters['output-1'], {# * 2})`);
        });

        it('returns successfully if string', (): void => {
            const result = arrayMap({ string: 'myArray' }, '{# * 2}');
            expect(result.toString()).to.equal(`map(myArray, {# * 2})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = arrayMap(fromJson(hyphenatedExpressionArgs), '{# * 2}');
            expect(result.toString()).to.equal(`map(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# * 2})`);
        });
    });

    describe('filter', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = filter(hyphenatedExpressionArgs, '{# > 1}');
            expect(result.toString()).to.equal(`filter(tasks['A-1'].outputs.parameters['output-1'], {# > 1})`);
        });

        it('returns successfully if string', (): void => {
            const result = filter({ string: 'myArray' }, '{# > 1}');
            expect(result.toString()).to.equal(`filter(myArray, {# > 1})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = filter(fromJson(hyphenatedExpressionArgs), '{# > 1}');
            expect(result.toString()).to.equal(
                `filter(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# > 1})`,
            );
        });
    });

    describe('find', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = find(hyphenatedExpressionArgs, '{# > 1}');
            expect(result.toString()).to.equal(`find(tasks['A-1'].outputs.parameters['output-1'], {# > 1})`);
        });

        it('returns successfully if string', (): void => {
            const result = find({ string: 'myArray' }, '{# > 1}');
            expect(result.toString()).to.equal(`find(myArray, {# > 1})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = find(fromJson(hyphenatedExpressionArgs), '{# > 1}');
            expect(result.toString()).to.equal(`find(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# > 1})`);
        });
    });

    describe('findIndex', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = findIndex(hyphenatedExpressionArgs, '{# > 1}');
            expect(result.toString()).to.equal(`findIndex(tasks['A-1'].outputs.parameters['output-1'], {# > 1})`);
        });

        it('returns successfully if string', (): void => {
            const result = findIndex({ string: 'myArray' }, '{# > 1}');
            expect(result.toString()).to.equal(`findIndex(myArray, {# > 1})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = findIndex(fromJson(hyphenatedExpressionArgs), '{# > 1}');
            expect(result.toString()).to.equal(
                `findIndex(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# > 1})`,
            );
        });
    });

    describe('findLast', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = findLast(hyphenatedExpressionArgs, '{# > 1}');
            expect(result.toString()).to.equal(`findLast(tasks['A-1'].outputs.parameters['output-1'], {# > 1})`);
        });

        it('returns successfully if string', (): void => {
            const result = findLast({ string: 'myArray' }, '{# > 1}');
            expect(result.toString()).to.equal(`findLast(myArray, {# > 1})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = findLast(fromJson(hyphenatedExpressionArgs), '{# > 1}');
            expect(result.toString()).to.equal(
                `findLast(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# > 1})`,
            );
        });
    });

    describe('findLastIndex', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = findLastIndex(hyphenatedExpressionArgs, '{# > 1}');
            expect(result.toString()).to.equal(`findLastIndex(tasks['A-1'].outputs.parameters['output-1'], {# > 1})`);
        });

        it('returns successfully if string', (): void => {
            const result = findLastIndex({ string: 'myArray' }, '{# > 1}');
            expect(result.toString()).to.equal(`findLastIndex(myArray, {# > 1})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = findLastIndex(fromJson(hyphenatedExpressionArgs), '{# > 1}');
            expect(result.toString()).to.equal(
                `findLastIndex(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# > 1})`,
            );
        });
    });

    describe('groupBy', (): void => {
        it('returns successfully if expressionArg', (): void => {
            const result = groupBy(hyphenatedExpressionArgs, '{# % 2}');
            expect(result.toString()).to.equal(`groupBy(tasks['A-1'].outputs.parameters['output-1'], {# % 2})`);
        });

        it('returns successfully if string', (): void => {
            const result = groupBy({ string: 'myArray' }, '{# % 2}');
            expect(result.toString()).to.equal(`groupBy(myArray, {# % 2})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = groupBy(fromJson(hyphenatedExpressionArgs), '{# % 2}');
            expect(result.toString()).to.equal(
                `groupBy(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# % 2})`,
            );
        });
    });

    describe('count', (): void => {
        it('returns successfully without predicate', (): void => {
            const result = count(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`count(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with predicate', (): void => {
            const result = count(hyphenatedExpressionArgs, '{# > 1}');
            expect(result.toString()).to.equal(`count(tasks['A-1'].outputs.parameters['output-1'], {# > 1})`);
        });

        it('returns successfully if string without predicate', (): void => {
            const result = count({ string: 'myArray' });
            expect(result.toString()).to.equal(`count(myArray)`);
        });

        it('returns successfully if fromJson expression with predicate', (): void => {
            const result = count(fromJson(hyphenatedExpressionArgs), '{# > 1}');
            expect(result.toString()).to.equal(`count(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {# > 1})`);
        });
    });

    describe('reduce', (): void => {
        it('returns successfully without initialValue', (): void => {
            const result = reduce(hyphenatedExpressionArgs, '{#acc + #}');
            expect(result.toString()).to.equal(`reduce(tasks['A-1'].outputs.parameters['output-1'], {#acc + #})`);
        });

        it('returns successfully with initialValue', (): void => {
            const result = reduce(hyphenatedExpressionArgs, '{#acc + #}', '0');
            expect(result.toString()).to.equal(`reduce(tasks['A-1'].outputs.parameters['output-1'], {#acc + #}, 0)`);
        });

        it('returns successfully if string', (): void => {
            const result = reduce({ string: 'myArray' }, '{#acc + #}');
            expect(result.toString()).to.equal(`reduce(myArray, {#acc + #})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = reduce(fromJson(hyphenatedExpressionArgs), '{#acc + #}', '0');
            expect(result.toString()).to.equal(
                `reduce(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {#acc + #}, 0)`,
            );
        });
    });

    describe('sum', (): void => {
        it('returns successfully without predicate', (): void => {
            const result = sum(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`sum(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with predicate', (): void => {
            const result = sum(hyphenatedExpressionArgs, '{#}');
            expect(result.toString()).to.equal(`sum(tasks['A-1'].outputs.parameters['output-1'], {#})`);
        });

        it('returns successfully if string without predicate', (): void => {
            const result = sum({ string: 'myArray' });
            expect(result.toString()).to.equal(`sum(myArray)`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = sum(fromJson(hyphenatedExpressionArgs));
            expect(result.toString()).to.equal(`sum(fromJSON(tasks['A-1'].outputs.parameters['output-1']))`);
        });
    });

    describe('sortBy', (): void => {
        it('returns successfully without predicate', (): void => {
            const result = sortBy(hyphenatedExpressionArgs);
            expect(result.toString()).to.equal(`sortBy(tasks['A-1'].outputs.parameters['output-1'])`);
        });

        it('returns successfully with predicate', (): void => {
            const result = sortBy(hyphenatedExpressionArgs, '{.Name}');
            expect(result.toString()).to.equal(`sortBy(tasks['A-1'].outputs.parameters['output-1'], {.Name})`);
        });

        it('returns successfully with predicate and order', (): void => {
            const result = sortBy(hyphenatedExpressionArgs, '{.Name}', 'desc');
            expect(result.toString()).to.equal(`sortBy(tasks['A-1'].outputs.parameters['output-1'], {.Name}, 'desc')`);
        });

        it('returns successfully if string', (): void => {
            const result = sortBy({ string: 'myArray' }, '{.Age}');
            expect(result.toString()).to.equal(`sortBy(myArray, {.Age})`);
        });

        it('returns successfully if fromJson expression', (): void => {
            const result = sortBy(fromJson(hyphenatedExpressionArgs), '{.Name}', 'asc');
            expect(result.toString()).to.equal(
                `sortBy(fromJSON(tasks['A-1'].outputs.parameters['output-1']), {.Name}, 'asc')`,
            );
        });
    });
});
