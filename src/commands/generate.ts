import { Command, Flags } from '@oclif/core';
import { existsSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { stringify } from 'yaml';

export class Generate extends Command {
    static description = 'Generates argo workflow yaml files from typescript files';

    static examples = [`<%= config.bin %> <%= command.id %>  --i ./examples/ --o ./output-examples/`];

    static flags = {
        input: Flags.directory({
            char: 'i',
            description: 'The input folder that contains one or more ts files to generate the output from',
            required: true,
            exists: true,
        }),
        output: Flags.directory({
            char: 'o',
            description: 'The output folder where the generated yaml files will be placed',
            required: true,
        }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(Generate);
        const files = await readdir(flags.input, { recursive: true, withFileTypes: true });

        for (const file of files) {
            if (!file.isFile) {
                continue;
            }

            if (!file.name.endsWith('.js')) {
                continue;
            }

            const fullPath = path.join(file.parentPath, file.name);
            const fileName = file.name.replace('.js', '');

            this.log(`Generating YAML for: ${fullPath}`);

            const hw = await import(fullPath).catch((error) => {
                this.log(error);
                this.log(`Failed to import at ${fullPath}`);
                this.exit(1);
            });

            if (!Object.getOwnPropertyNames(hw).includes('generateTemplate')) {
                this.log(`${fullPath} did not export a generateTemplate function`);
                continue;
            }

            const result = await hw.generateTemplate();

            const header = `# yamllint disable rule:line-length
###############################################################################
#                                                                             #
#                                                                             #
#                       This file was generated via Juno                      #
#                       Do not modify this file directly!                     #
#                                                                             #
#                                                                             #
###############################################################################

`;

            const yaml = stringify(result, { lineWidth: 0, aliasDuplicateObjects: false });

            const nestedPath = file.parentPath.replace(flags.input, '');

            const outputPath = path.join(flags.output, nestedPath);

            if (!existsSync(outputPath)) {
                this.log(`Creating directory: ${outputPath}`);

                await mkdir(outputPath, { recursive: true });
            }

            await writeFile(path.join(outputPath, `${fileName}.yaml`), header.concat(yaml));
        }
    }
}
