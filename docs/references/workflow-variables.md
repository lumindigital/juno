# Workflow Variables
There are two types of [template tags](https://argo-workflows.readthedocs.io/en/latest/variables/) in argo workflows, simple and expression.

## Simple Template Tag
Simple expressions use the `{{}}` format. When the workflow is run, whatever is inside the brackets is substituted for the real thing.

The `ExpressionArgs` union type in Juno is used to construct many of the more complicated simple expressions.

The simpleTag function is used to convert `ExpressionArgs` into a simple tag format when rendered.
```ts
function simpleTag(input: ExpressionArgs | string): string {}

// an example that would return "my_string"
simpleTag({string: "my_string"});
```

The following table shows the object signatures for each `ExpressionArgs` type when using simpleTag. Note: some of these examples are contrived to show how the input type is returned and would not be used with `simpleTag` in juno

| Juno Type| Argo Workflow Output| Comments| Example |
|----------|---------------------|---------|---------|
| `simpleTag({string: 'my_string')` | `my_string`| Use this type if there isn't a built in type for the value you need | [custom-metrics](../../examples/argo/custom-metrics.ts)
| `simpleTag(new InputParameter('input_param', {}))` | `{{inputs.parameters.input_param}}` | | [daemon-step](../../examples/argo/daemon-step.ts)
| `simpleTag(new InputArtifact('input_art', {}))`| `{{inputs.artifacts.input_art}}`| | [nested-workflow](../../examples/argo/nested-workflow.ts)
| `simpleTag(new WorkflowParameter('wf_param', {}))` | `{{workflow.parameters.wf_param}}`| | [buildkit-template](../../examples/argo/buildkit-template.ts) |
| `simpleTag({ dagTaskResult: new DagTask('dag_task', {}) result: TaskResult.Succeeded })` | `{{dag_task.Succeeded}}`| This is only used in `DagTask.dependsExpression`| [dag-continue-on-fail](../../examples/argo/dag-continue-on-fail.ts)
| `simpleTag({ dagTask: new DagTask('dag_task', {}), output: new OutputArtifact('out_art') })` | `{{tasks.dag_task.outputs.artifacts.out_art}}`| | [dag-conditional-artifacts](../../examples/argo/dag-conditional-artifacts.ts)
| `simpleTag({ dagTask: new DagTask('dag_task', {}), output: new OutputParameter('out_param') })`| `{{tasks.dag_task.outputs.parameters.out_param}}` | |  [dag-conditional-parameters](../../examples/argo/parameter-aggregation-dag.ts)
| `simpleTag({ dagTask: new DagTask('dag_task', {}), output: new OutputResult() })`| `{{tasks.dag_task.outputs.parameters.result}}`| | [coinflip-recursive](../../examples/argo/coinflip-recursive.ts)
| `simpleTag({ dagTask: new DagTask('dag_task', {}), output: 'id' })`| `{{tasks.dag_task.outputs.id}}` | Useful when using built-in properties |
| `simpleTag({ dagTaskName: 'dag_task', output: new OutputArtifact('out_art') })`| `{{tasks.dag_task.outputs.artifacts.out_art}}`| Useful when dealing with nested tasks inside a hook | No Example
| `simpleTag({ dagTaskName: 'dag_task', output: new OutputParameter('out_param') })` | `{{tasks.dag_task.outputs.parameters.out_param}}` | Useful when dealing with nested tasks inside a hook | No Example
| `simpleTag({ dagTaskName: 'dag_task', output: new OutputResult() })` | `{{tasks.dag_task.outputs.parameters.result}}`| Useful when dealing with nested tasks inside a hook |  No Example
| `simpleTag({ dagTaskOutputParameter: new DagTask('dag_task', {}) })` | `{{tasks.dag_task.outputs.parameters}}` | | [parameter-aggregation](../../examples/argo/parameter-aggregation-dag.ts)
| `simpleTag({ workflowStep: new WorkflowStep('wf_step', {}), output: new OutputArtifact('out_art') })`| `{{steps.wf_step.outputs.artifacts.out_art}}` | | [artifact-disable-archive](../../examples/argo/artifact-disable-archive.ts)
| `simpleTag({ workflowStep: new WorkflowStep('wf_step', {}), output: new OutputParameter('out_param') })` | `{{steps.wf_step.outputs.parameters.out_param}}`| | [fibonacci-seq-conditional-param](../../examples/argo/fibonacci-seq-conditional-param.ts)
| `simpleTag({ workflowStep: new WorkflowStep('wf_step', {}), output: new OutputResult() })` | `{{steps.wf_step.outputs.parameters.result}}` | |  [exit-handler-with-param](../../examples/argo/exit-handler-with-param.ts)
| `simpleTag({ workflowStep: new WorkflowStep('wf_step', {}), output: 'id' })` | `{{steps.wf_step.id}}`| Useful when using built-in properties | [daemon-nginx](../../examples/argo/daemon-nginx.ts)
| `simpleTag({ workflowStepName: 'wf_step', output: new OutputArtifact('out_art') })`| `{{steps.wf_step.outputs.artifacts.out_art}}` | Useful when dealing with nested steps inside a hook | [dag-daemon-task](../../examples/argo/dag-daemon-task.ts)
| `simpleTag({ workflowStepName: 'wf_step', output: new OutputParameter('out_param') })` | `{{steps.wf_step.outputs.parameters.out_param}}`| Useful when dealing with nested steps inside a hook | [fibonacci-seq-conditional-param](../../examples/argo/fibonacci-seq-conditional-param.ts)
| `simpleTag({ workflowStepName: 'wf_step', output: new OutputResult() })` | `{{steps.wf_step.outputs.parameters.result}}` | Useful when dealing with nested steps inside a hook | [coinflip-recursive](../../examples/argo/coinflip-recursive.ts)
| `simpleTag({ workflowStepName: 'wf_step', output: 'status' })` | `{{steps.wf_step.outputs.status}}` | Useful when dealing with nested steps inside a hook |
| `simpleTag({ workflowStepOutputParameter: new WorkflowStep('wf_step', {}) })`| `{{tasks.dag_task.outputs.parameters}}` | | [parameter-aggregation](../../examples/argo/parameter-aggregation.ts)
| `simpleTag({ pathResult: new OutputParameter('output_param', {})})`| `{{outputs.parameters.output_param.path}}`| |  [artifact-path-placeholders](../../examples/argo/artifact-path-placeholders.ts)
| `simpleTag({ pathResult: new OutputArtifact('out_art')})`| `{{outputs.artifacts.out_art.path}}`| | [artifact-path-placeholders](../../examples/argo/artifact-path-placeholders.ts)
| `simpleTag({ pathResult: new InputArtifact('input_art', {})})` | `{{inputs.artifacts.input_art.path}}` | | [artifact-path-placeholders](../../examples/argo/artifact-path-placeholders.ts)
| `simpleTag({ workflowOutput: new OutputParameter('output_param', { globalName: 'global_param'})})` | `{{ workflow.outputs.parameters.global_param }}`| | [global-outputs](../../examples/argo/global-outputs.ts)
| `simpleTag({ workflowOutput: new OutputArtifact('out_art', { globalName: 'global_art'})})` | `{{ workflow.outputs.artifacts.global_art }}` | |
| `simpleTag(new FromItemProperty('item_key'))`| `{{item.item_key}}` | | [ci-output-artifact](../../examples/argo/ci-output-artifact.ts)
| `simpleTag(new FromItemProperty())`| `{{item}}`| | [data-transformations](../../examples/argo/data-transformations.ts)

## Parameters and Artifacts
Objects that represent either a parameter or an artifact do no require use a `simpletag()` These objects have `valueFromExpressionArgs` as a property on the objects that removes the need for it.

## Expression Template Tag
Expression Tags use the `{{=}}`. Expression tags are substituted with the result of evaluating tag as an expression. Juno currently has partial support for the [Expr](https://expr-lang.org/) library. Most of the example workflows that use the expr library have support in Juno. Juno will not be adding any support for sprig at this time.


This function wraps a string in the expression template tags
```ts
export function expressionTag(input: ExpressionTagTemplateInputs): ExpressionTemplateTag {

// an example that would return "{{=inputs.parameters.test}}"
expressionTag("inputs.parameters.test").toString();
```

In places where expressionTags are commonly used, the input takes an expressionTag directly. For example
```ts
new WorkflowStep('print-hello-expr-json', {
    template: argosayTemplate,
    whenExpression: expressionTag(equals(jsonPath(new WorkflowParametersJson(), '$[0].value'), 'true')),
}),
```
Would generate the following yaml
```yaml
steps:
  - name: print-hello-expr-json
    template: argosay
    when: "{{=jsonpath(workflow.parameters.json, '$[0].value') == 'true'}}" # expr form
```

See the [example workflows](../../examples/juno/expressions) on how to use all of expressions built into Juno