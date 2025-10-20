import { runCommand } from '@oclif/test';
import { expect } from 'chai';

describe('generate', () => {
    it('runs generate cmd', async () => {
        const { stdout } = await runCommand('generate');
        expect(stdout).to.contain('');
    });
});
