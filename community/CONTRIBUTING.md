# Contributing to Juno

This document outlines the process of committing changes to the Juno project. In order to ensure that your contributions are accepted, please open an issue, and get the issue assigned to you before opening a PR.


## Code of Conduct

You must read and agree to follow the [Juno Code of Conduct](https://github.com/lumindigital/juno/blob/main/community/CODE_OF_CONDUCT.md)

## Installation and Setup
1. Clone Repository
2. Run `npm i`
3. Run `npm run build`

You can run the tests via `npm run test`.

To run the cli from this project you can use the following
```bash
./bin/dev.js generate
./bin/run.js generate
```

### Commit Hooks
This repository uses [pre-commit](https://pre-commit.com) hooks to ensure code quality and consistency. It allows you to automatically run linters, formatters, and other tools before committing code.
These checks also run when you open a PR.

To install pre-commit follow the instructions [here](https://pre-commit.com/#install)


To install the hooks in this repo, run the following command from the root of the repository.
```bash
pre-commit install
```


## General workflow

Before beginning work, please make sure the issue you are working on has been assigned to you.
This workflow uses the [Conventional Commits](https://www.conventionalcommits.org) specification for commit messages.

The Workflow is as follows
1. Fork the Juno repository under your github username.
2. Create a branch in your forked repository.
4. Commit changes required to the branch you created on step 2.
5. Verify that tests and pre-commit passes
6. Push your branch to your forked repository.
7. Create a Pull Request from your remote fork pointing to the HEAD branch (usually `master` branch) of the target repository.
8. Check the github build and ensure that all checks are green.


## Testing
If your adding new functionality or modifying existing functionality and there is currently not tests, please add them as part of your pull request.
Tests can be ran with the following command
```bash
npm run test
```

### Debugging Tests
Note: There is currently an issue with debugging the tests in vscode. The test harness at `test/examples/test-harness.test.ts` line 84 sets the path when debugging.
Seems to be a bug with either nodejs or vscode. Haven't had time to track it down though.


## Regenerating Interfaces
If your updating the interfaces for Argo, you will need to do the following

1. Run the npm command `npm interfaces`
2. Do a compare of the previous version with the new version, modify any custom objects so they match the new spec's
3. Ensure all the test pass

Also, review the [examples](https://github.com/argoproj/argo-workflows/tree/main/examples) from the argo project and see if any new examples need to be added to the project for new features
