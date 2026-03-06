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

See [Workflow Variables](workflow-variables.md) for details about the different types of `ExpressionArgs` available. See the [Artifact Disable Archive Example](../../examples/argo/artifact-disable-archive.ts) for an example of a workflow that uses this pattern.

### valueFromExpressionTag
`valueFromExpressionTag` is used to set the `from` value to a complex expression. This can be used on both input and output artifacts. This is the preferred way to reference complex variables.

```ts
 valueFromExpressionTag?: ExpressionTemplateTag;
```

Example
There is currently not an example with this use case.

See [Expression Examples](../../examples/juno/expressions/) for examples using expressions

## DagTask
### dependenciesExpressions
`dependenciesExpressions` is used to set the `dependencies` value to a list of dagTask Names. This is the preferred way to set `dependencies`
```ts
dependenciesExpressions?: DagTask[];
```

Example
```ts
    const cacheRestoreTask = new DagTask('cache-restore', {
        template: cacheRestoreTemplate,
    });

    const cloneTask = new DagTask('clone', {
        template: cloneTemplate,
    });

    const depsTask = new DagTask('deps', {
        dependenciesExpressions: [cloneTask, cacheRestoreTask],
        template: depsTemplate,
    });
```
Yaml Output
```yaml
dag:
  tasks:
  - name: cache-restore
    template: cache-restore
  - name: clone
    template: clone
  - name: deps
    template: deps
    dependencies:
      - clone
      - cache-restore
```

See the [CI Workflow Template Example](../../examples/argo/ci-workflowtemplate.ts) for an example of a workflow that uses this pattern

## DagTemplate
### targets
`targets` is used to set the `target` value to a complex expression. This is the preferred way to reference complex variables

```ts

```

Example
```ts
const dagTargetTemplate = new Template('dag-target', {
    dag: new DagTemplate({
        targets: [target],
    }),
});
```
Yaml Output
```yaml
dag:
  target: "{{workflow.parameters.target}}"
```

See the [Dag Targets Example](../../examples/argo/dag-targets.ts) for an example of a workflow that uses this pattern

### dependsExpression
`dependsExpression` is used to set the `depends` value to an expression. This is the preferred way to set `depends`
```ts
dependsExpression?: TaskOutput | StepOutput | DagTask | TaskAndResult | WorkflowStep | LogicalExpression;
```

Example
```ts
    const taskB = new DagTask('B', {
        dependsExpression: taskA,
        template: intentionalFailTemplate,
    });
    const taskC = new DagTask('C', {
        dependsExpression: taskA,
        template: helloWorldTemplate,
    });
    const taskD = new DagTask('D', {
        dependsExpression: and([{ dagTaskResult: taskB, result: TaskResult.Failed }, taskC]),
        template: helloWorldTemplate,
    });
```
Yaml Output
```yaml
dag:
  tasks:
    - name: B
      depends: "A"
      template: intentional-fail
    - name: C
      depends: "A"
      template: hello-world
    - name: D
      depends: "B.Failed && C"
      template: hello-world
```

See [CI Workflow Template Example](../../examples/argo/ci-workflowtemplate.ts) for an example of a workflow that uses this pattern

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

### whenExpression
`whenExpression` is used to set `when` to an `ExpressionTemplateTag`,`ComparisonExpression`, or `LogicalExpression`

```ts
whenExpression?: ExpressionTemplateTag | ComparisonExpression | LogicalExpression;
```

Example
```ts
const headsTask = new DagTask('heads', {
    dependsExpression: flipCoinTask,
    template: headsTemplate,
    whenExpression: equals(simpleTag({ dagTask: flipCoinTask, output: new OutputResult() }), 'heads'),
});
```
Yaml Output
```yaml
 - name: heads
   depends: flip-coin
   template: heads
   when: "{{tasks.flip-coin.outputs.result}} == heads"
```

See [DAG Conditional Artifacts Example](../../examples/argo/dag-conditional-artifacts.ts) for an example of a workflow that uses this pattern

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

### valueFromExpressionTag
`valueFromExpressionTag` is used to set the `value` value to a complex expression. This is the preferred way to reference complex variables.

```ts
 valueFromExpressionTag?: ExpressionTemplateTag;
```

Example
```ts
const addParam = new InputParameter('add-param');

new EnvironmentVariable('ADD_EQUALS', {
    valueFromExpressionTag: expressionTag(equals(hyphenateExpressionArgs(addParam), '3')),
}),
```
Yaml Output
```yaml
env:
  - name: ADD_EQUALS
    value: "{{=inputs.parameters['add-param'] == '3'}}"
```

See the [Arithmetic Example](../../examples/juno/expressions/arithmetic.ts) for an example of a workflow that uses this pattern.

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
See the [Artifact Disable Archive Example](../../examples/argo/artifact-disable-archive.ts) for an example of a workflow that uses this pattern.

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
See [Workflow Variables](workflow-variables.md) for details about the different types of `ExpressionArgs` available. See the [Buildkit Template Example](../../examples/argo/buildkit-template.ts) for an example of a workflow that uses this pattern.

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
See the [Argument Parameters Example](../..argo/argument-parameters.ts) for an example of a workflow that uses this pattern.

## Parameter
### valueFromExpressionArgs
`valueFromExpressionArgs` is used to set the `from` value to a simple expression. This can be used on both input and output artifacts. This is the preferred way to reference variables.
```ts
 valueFromExpressionArgs?: ExpressionArgs;
```

Example
```ts
const printMessageInputMessageParam = new InputParameter('message');

arguments: new Arguments({
  parameters: [
    printMessageInputMessageParam.toArgumentParameter({
      valueFromExpressionArgs: {
        workflowStep: generateParameter,
        output: helloOutputParam,
      },
    }),
  ],
}),
```
Yaml Output
```yaml
arguments:
  parameters:
  - name: message
    value: "{{steps.generate-parameter.outputs.parameters.hello-param}}"
```

See [Workflow Variables](workflow-variables.md) for details about the different types of `ExpressionArgs` available. See the [Output Parameter Example](../../examples/argo/output-parameter.ts) for an example of a workflow that uses this pattern.

### valueFromExpressionTag
`valueFromExpressionTag` is used to set the `value` value to a complex expression. This is the preferred way to reference complex variables.

```ts
 valueFromExpressionTag?: ExpressionTemplateTag;
```

Example
```ts
const intParam = new InputParameter('int-param');
const workflowIntParam = new WorkflowParameter('workflow-int-param', { value: '1' });

parameters: [
  intParam.toArgumentParameter({
    valueFromExpressionTag: expressionTag(
      equals(asInt(hyphenateExpressionArgs(workflowIntParam)), 1),
    ),
  }),
]
```
Yaml Output
```yaml
- arguments:
  parameters:
    - name: int-param
      value: "{{=asInt(workflow.parameters['workflow-int-param']) == 1}}"
```

See the [Cast example](../../examples/juno/expressions/cast.ts) for an example of a workflow that uses this pattern.


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
See the [Coinflip Recursive Example](../../examples/argo/coinflip-recursive.ts) for an example of a workflow that uses this pattern.

## ParameterValueFrom
### expressionFrom
`expressionFrom` is used by the property `valueFrom` on the `Parameter` class to set an `expression` value to a complex expression. This is the preferred way to set complex variables.

```ts
expressionFrom?: ExpressionTemplateInputs | CastExpressions | JsonPathExpression;
```

Example
```ts
parameters: [
  new OutputParameter('stepresult', {
    valueFrom: new ParameterValueFrom({
      expressionFrom: ternary(
        equals(
          hyphenateExpressionArgs({ dagTask: flipCoinTask, output: new OutputResult() }),
            'heads',
        ),
        hyphenateExpressionArgs({ dagTask: headsTask, output: new OutputResult() }),
        hyphenateExpressionArgs({ dagTask: tailsTask, output: new OutputResult() }),
      ),
    }),
  }),
],
```
Yaml Output
```yaml
parameters:
  - name: stepresult
    valueFrom:
      expression: "tasks['flip-coin'].outputs.result == 'heads' ? tasks.heads.outputs.result : tasks.tails.outputs.result"
```

See the [Dag Conditional Parameters Example](../../examples/argo/dag-conditional-parameters.ts) for an example of a workflow that uses this pattern.

## Script
### EnvironmentVariable
See [EnvironmentVariable](#EnvironmentVariable) for details about api changes to environment variables.

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
See the [Cluster WorkflowTemplate Dag Example](../../examples/argo/cluster-workflow-template/cluster-wftmpl-dag.ts) for an example of a workflow that uses this pattern.

## WorkflowSpec
### additionalTemplates
`additionalTemplates` is used to specify additional templates that are child templates of the entrypoint templates.
This is useful when have a shared template that isn't meant to be run directly.

See the [Http Success Condition Example](../../examples/argo/http-success-condition.ts) for an example of a workflow that uses this pattern.

### templates
Templates are no longer specified on the workflow spec. Juno will walk the entrypoint template and any templates it requires and adds them automatically to the workflow spec.
If for some reason you need to add templates to a workflow you use the [additionalTemplates](#additionalTemplates) property
