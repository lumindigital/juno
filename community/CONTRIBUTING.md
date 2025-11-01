# Contributing to Juno

This document outlines the process of committing changes to the Juno project. In order to ensure that your contributions are accepted, please open an issue, and get the issue assigned to you before opening a PR.


## Code of Conduct

You must read and agree to follow the [Juno Code of Conduct](https://github.com/lumindigital/juno/blob/main/community/CODE_OF_CONDUCT.md)

## General workflow

Before beginning work, please make sure the issue you are working on has been assigned to you.
This workflow uses the [Conventional Commits](https://www.conventionalcommits.org) specification for commit messages.

The Workflow is as follows
1. Fork the Juno repository under your github username.
2. Create a branch in your forked repository.
3. Commit changes required to the branch you created on step 2.
4. Push your branch to your forked repository.
5. Create a Pull Request from your remote fork pointing to the HEAD branch (usually `master` branch) of the target repository.
6. Check the github build and ensure that all checks are green.

## Testing
If your adding new functionality or modifying existing functionality and there is currently not tests, please add them as part of your pull request.