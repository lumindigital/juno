import { assert, expect } from 'chai';
import { readFileSync, readdirSync } from 'node:fs';
import { Logger, createLogger, format, transports } from 'winston';
import { parse } from 'yaml';
import { Template } from '../../src/api/template';

describe('example tests', (): void => {
    let logger: Logger;

    before(() => {
        logger = createLogger({
            format: format.json(),
            level: 'info',
            transports: [new transports.Console()],
        });
    });

    it('Runs examples successfully', async () => {
        const tests = getExamples();

        // Dynamic tests don't seem to work with mocha test runner, so I am just looping inside a single test :(
        logger.warn(`Found ${tests.size} tests`);

        for (const test of tests) {
            const path = `${test[1]}/${test[0]}`;
            logger.warn(`Running test: ${path}`);

            const yaml = readFileSync(`${path}.yaml`, 'utf8');
            const workflow = parse(yaml);

            if (workflow.spec.templates !== undefined) {
                workflow.spec.templates = workflow.spec.templates?.sort((a: Template, b: Template) =>
                    a.name.localeCompare(b.name),
                );
            }

            if (workflow.spec.workflowSpec?.templates !== undefined) {
                workflow.spec.workflowSpec.templates = workflow.spec.workflowSpec.templates?.sort(
                    (a: Template, b: Template) => a.name.localeCompare(b.name),
                );
            }

            const hw = await import(`../../${path}`).catch((error) => {
                logger.error({ err: error, message: `Failed to import at ${path}` });
                assert.fail(error);
            });

            if (!Object.getOwnPropertyNames(hw).includes('generateTemplate')) {
                assert.fail(`generateTemplate not found in module at ${path}`);
            }

            const result = await hw.generateTemplate();

            // This removes the undefined values from the object. And is what the cli will likely do as well
            const result2 = parse(JSON.stringify(result));

            // logger.info(stringify(result2));

            expect(result2, path).to.deep.equal(workflow);
        }

        logger.warn(`Ran ${tests.size} tests successfully`);
    });
});

function getExamples(): Map<string, string> {
    console.log(process.cwd());
    const tests = new Map<string, string>();

    const files = readdirSync('./examples', { withFileTypes: true, recursive: true });

    for (const file of files) {
        if (!file.isFile) {
            continue;
        }

        if (!file.name.endsWith('.ts')) {
            continue;
        }

        const fileName = file.name.replace('.ts', '');

        // For some reason parentPath is null when running the example tests with a debugger. Uncommenting this will fix it.
        // if (!file.parentPath) {
        //     file.parentPath = './examples';
        // }

        tests.set(fileName, file.parentPath);
    }

    return tests;
}
