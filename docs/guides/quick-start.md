# Quick Start
You can use the [example project](https://github.com/lumindigital/juno-workflow-example) as a base for your own juno-workflows project, or you can roll your own

If you wish to create a project from scratch, you can use the following guidelines

## Requirements
You will need an LTS release of Node.js in order to use Juno.
Juno uses the lastest version of typescript

The example project setup below uses the [yamlfmt](https://github.com/google/yamlfmt) command line tool to format the output.

## Project Setup
Run the following commands from the root of your project folder to generate a new project that includes a hello-world workflow

```shell
npm init
npm pkg set type="module";
npm pkg set scripts.pregenerate="rm -rf ./output && npm run build"
npm pkg set scripts.generate='npx juno generate -i $INIT_CWD/dist -o ./output && yamlfmt ./output/**'
npm pkg set scripts.build="rm -rf dist && tsc"
npm pkg set scripts.lint="npx eslint ."
npm pkg set scripts.pretty="npx prettier --write \"./**/*.{js,jsx,mjs,cjs,ts,tsx}\""

npm i --save-dev typescript @lumindigital/juno @eslint/eslintrc @eslint/js eslint eslint-config-prettier prettier typescript-eslint

cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "declaration": false,
    "module": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "target": "es2022",
    "moduleResolution": "node16",
    "composite": false,
  },
  "include": [
    "./src/**/*"
  ],
  "ts-node": {
    "esm": true
  }
}
EOF

cat > .prettierrc.mjs <<EOF
const config = {
    semi: true,
    trailingComma: 'all',
    singleQuote: true,
    printWidth: 120,
    tabWidth: 4,
};

export default config;

EOF

cat > eslint.config.mjs <<EOF
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default tseslint.config(js.configs.recommended, tseslint.configs.recommended, ...compat.extends('prettier'), {
    ignores: ['dist'],
});
EOF

mkdir src
cat > src/hello-world.ts <<EOF
import { IoArgoprojWorkflowV1Alpha1Workflow } from '@lumindigital/juno/dist/workflow-interfaces/data-contracts.js';
import { Container } from '@lumindigital/juno/dist/api/container.js';
import { Template } from '@lumindigital/juno/dist/api/template.js';
import { Workflow } from '@lumindigital/juno/dist/api/workflow.js';
import { WorkflowSpec } from '@lumindigital/juno/dist/api/workflow-spec.js';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloWorldTemplate = new Template('hello-world', {
        container: new Container({
            args: ['hello world'],
            command: ['echo'],
            image: 'busybox',
        }),
    });

    return new Workflow({
        metadata: {
            annotations: {
                'workflows.argoproj.io/description': \`This is a simple hello world example.\n\`,
            },
            generateName: 'hello-world-',
            labels: {
                'workflows.argoproj.io/archive-strategy': 'false',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: helloWorldTemplate,
        }),
    }).toWorkflow();
}

EOF

npm run generate
cat output/hello-world.yaml
```