# Good Practices


## Self Contained Workflows
There are several challenges with using template ref's.

* Shared templates cannot be versioned
* There is no way to validate that a shared template exists when generating manifests via juno

A good practice when using Juno is to self contain all of your workflows, and remove any template refs. Doing so make it much easier to work on a single workflow without breaking other workflows.

## Prefer objects over strings
Juno tries hard to eliminate many of the places where magic strings exist. That is a key reason why the project was started. While some places allow strings over objects it is preferable to use the objects

## Prefer local over global variables
While the global variables are nice its a good practice to prefer passing global variables in as an input

## DAG Entrypoint
Make you entrypoint a DAG with a single task that runs the actual work. If you follow the previous advice about preferring local variables, the entrypoint dag should be the only place you reference any global variables.

