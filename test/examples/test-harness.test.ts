import { assert, expect } from 'chai';
import { readdirSync, readFileSync } from 'node:fs';

import { Logger, createLogger, format, transports } from 'winston';
import { Template } from '../../src/api/template';
import { parse } from 'yaml';

describe('example tests', (): void => {
    let logger: Logger;
    let tests: Map<string, string>;

    before(() => {
        logger = createLogger({
            format: format.json(),
            level: 'info',
            transports: [new transports.Console()],
        });
        tests = getExamples();
    });

    it('Runs examples successfully', async () => {
        describe('Generated spec', async () => {
            tests.forEach(async (parentPath, testName) => {
                const path = `${parentPath}/${testName}`;
                it(`Running example test: ${path}`, async () => {
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
                    expect(result2, `${path}`).to.deep.equal(workflow);
                });
            });
        });
    });

    //     for (const test of tests) {

    // });
});

function getExamples(): Map<string, string> {
    const tests = new Map<string, string>();

    const files = readdirSync('./examples', { withFileTypes: true, recursive: true });

    for (const file of files) {
        if (process.env.TEST_NAME) {
            if (!file.name.includes(process.env.TEST_NAME)) {
                continue;
            }
        }

        if (!file.isFile) {
            continue;
        }

        if (!file.name.endsWith('.ts')) {
            continue;
        }

        const fileName = file.name.replace('.ts', '');
        tests.set(fileName, file.parentPath);
    }

    return tests;
}
