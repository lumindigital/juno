# API Differences
Juno is designed to reduce the friction when building workflows. As such the api of juno differs from the argo workflows api.

## Artifact
### valueFromExpressionArgs
`valueFromExpressionArgs` is used to set the `from` value to a simple expression. This can be used on both input and output artifacts. This is the preferred way to reference variables.
```ts
 valueFromExpressionArgs?: ExpressionArgs;
```

Example
```ts
valueFromExpressionArgs: {
    workflowStep: new WorkflowStep('generate-artifact', {}),
    output: etcOutputArtifact,
}
```
Yaml Output
```yaml
artifacts:
  - name: etc
    from: "{{steps.generate-artifact.outputs.artifacts.etc}}"
```

See [Workflow Variables](workflow-variables.md) for details about the different types of `ExpressionArgs` available. See the [Artifact Disable Archive Example](../../examples/artifact-disable-archive.ts) for an example of a workflow that uses this pattern.

## DagTask
### withParamExpression
`withParamExpression` is used to set `withParamExpression` to either a string, or a simple expression.

```ts
withParamExpression?: string | InputParameter | TaskOutput | StepOutput | StepOutputParameters | TaskOutputParameters;
```

Example
```ts
withParamExpression: simpleTag({ workflowStep: new WorkflowStep('list-log-files', {}), output: new OutputResult() }),
```
Yaml Output
```yaml
withParam: "{{steps.list-log-files.outputs.result}}"
```
See [Workflow Variables](workflow-variables.md) for details about the different types of `ExpressionArgs` available. See the [Data Transformations Example](../../examples/data-transformations.ts) for an example of a workflow that uses this pattern.

## EnvironmentVariable
### valueFromInputParameter
`valueFromInputParameter` is used to convert an input parameter into a simple expression value.
```ts
valueFromInputParameter?: InputParameter;
```

Example
```ts
 new EnvironmentVariable('A', {
    valueFromInputParameter: new InputParameter('a', {}),
})
```
Yaml Output
```ts
- name: A
  value: "{{inputs.parameters.a}}"
```
See [Workflow Variables](workflow-variables.md) for details about the different types of `ExpressionArgs` available. See the [Expression Destructure JSON Complex Example](../../examples/expression-destructure-json-complex.ts) for an example of a workflow that uses this pattern.

## Inputs
### Artifacts
#### toArgumentArtifact

The `toArgumentArtifact` converts a `InputArtifact` into an `ArgumentArtifact`.
```ts
toArgumentArtifact(init?: Partial<InputArtifact>): ArgumentArtifact {
    return new ArgumentArtifact(this.name, init);
}
```

Example
```ts
artifacts: [
    new InputArtifact('etc', {}).toArgumentArtifact({
        valueFromExpressionArgs: {
            workflowStep: new WorkflowStep('generate-artifact', {}),
            output: new OutputArtifact('etc', {}),
        },
    })
]
```
Yaml Output
```yaml
 artifacts:
  - name: etc
    from: "{{steps.generate-artifact.outputs.artifacts.etc}}"
```
See the [Artifact Disable Archive](../../examples/artifact-disable-archive.ts) for an example of a workflow that uses this pattern.

### Parameters
#### toArgumentParameter
The `toArgumentParameter` function converts a `InputParameter` into an `ArgumentParameter`
```ts
toArgumentParameter(init?: Partial<InputParameter>): ArgumentParameter {
    return new ArgumentParameter(this.name, init);
}
```

Example
```ts
parameters: [
  repoInputParameter.toArgumentParameter({ valueFromExpressionArgs: new WorkflowParameter('repo', {})})
]
```
Yaml Output
```yaml
parameters:
  - name: repo
    value: "{{workflow.parameters.repo}}"
```
See [Workflow Variables](workflow-variables.md) for details about the different types of `ExpressionArgs` available. See the [Buildkit Template](../../examples/buildkit-template.ts) for an example of a workflow that uses this pattern.

#### toWorkflowParameter
The `toWorkflowParameter` function converts a `InputParameter` into a `WorkflowParameter`
```ts
toWorkflowParameter(init?: Partial<InputParameter>): WorkflowParameter {
    return new WorkflowParameter(this.name, init);
}

```
Example
```ts
parameters: [
    printMessageInputMessageParam.toWorkflowParameter({
        value: 'hello world',
    }),
]
```
Yaml Output
```yaml
parameters:
  - name: message
    value: hello world
```
See the [Argument Parameters](../../examples/argument-parameters.ts) for an example of a workflow that uses this pattern.


## RecursiveTemplate
`RecursiveTemplate` is used in places where a template references itself due to the design of Juno.

Example
```ts
new WorkflowStep('tails', {
    template: new RecursiveTemplate('coinflip'),
    when: `${simpleTag({ workflowStep: flipCoinStep, output: new OutputResult() })} == tails`,
})
```
Yaml Output
```yaml
- name: tails
  template: coinflip
  when: "{{steps.flip-coin.outputs.result}} == tails"
```
See the [Coinflip Recursive Example](../../examples/coinflip-recursive.ts) for an example of a workflow that uses this pattern.


## Script
### EnvironmentVariable
See [EnvironmentVariable](##EnvironmentVariable) for details about api changes to environment variables.

## Template Reference
`TemplateReference` is used by `templateRef` when referencing a template in another workflow. Juno recommends avoiding the use of templateRef if possible.
Note: template reference will always specify the clusterScope when used

Example
```ts
 templateRef: new TemplateReference({
    workflowTemplate: new ClusterWorkflowTemplate({metadata: { name: 'cluster-workflow-template-print-message', }}),
    template: new Template('print-message', {})
})
```
Yaml Output
```yaml
templateRef:
  name: cluster-workflow-template-print-message
  template: print-message
  clusterScope: true
```
See the [Cluster WorkflowTemplate Dag Example](../../examples/cluster-workflow-template/cluster-wftmpl-dag.ts) for an example of a workflow that uses this pattern.

## WorkflowSpec
### additionalTemplates
`additionalTemplates` is used to specify additional templates that are child templates of the entrypoint templates.
This is useful when have a shared template that isn't meant to be ran directly.

See the [Http Success Condition Example](../../examples/http-success-condition.ts) for an example of a workflow that uses this pattern.

### templates
Templates are no longer specified on the workflow spec. Juno will walk the entrypoint template and any templates it requires and adds them automatically to the workflow spec.
If for some reason you need to add templates to a workflow you use the [additionalTemplates](###additionalTemplates)  property
