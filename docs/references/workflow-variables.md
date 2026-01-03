# Workflow Variables
There are two types of [template tags](https://argo-workflows.readthedocs.io/en/latest/variables/) in argo workflows, simple and expression.

## Simple Template Tag
Simple expressions use the `{{}}` format. When the workflow is run, whatever is inside the brackets is substituted for the real thing.

The `ExpressionArgs` union type in Juno is used to construct many of the more complicated simple expressions.

The simpleTag function is used to convert `ExpressionArgs` into a simple tag format when rendered.
```ts
function simpleTag(input: ExpressionArgs | string): string {}

// an example that would return "{{inputs.parameters.test}}"
simpleTag("inputs.parameters.test");
```

The following table shows the object signatures for each supported type when using simpleTag

| Juno Type                                                                                                | Argo Workflow Output                              | Comments                                                            |
|----------------------------------------------------------------------------------------------------------|---------------------------------------------------|---------------------------------------------------------------------|
| `simpleTag(string)`                                                                                      | `string`                                          | Use this type if there isn't a built in type for the value you need |
| `simpleTag(new InputParameter('input_param', {}))`                                                       | `{{inputs.parameters.input_param}}`               |                                                                     |
| `simpleTag(new InputArtifact('input_art', {}))`                                                          | `{{inputs.artifacts.input_art}}`                  |                                                                     |
| `simpleTag(new WorkflowParameter('wf_param', {}))`                                                       | `{{workflow.parameters.wf_param}}`                |                                                                     |
| `simpleTag({ task: new DagTask('dag_task', {}) result?: TaskResult.Succeeded })`                         | `{{dag_task.Succeeded}}`                          | This is only used in `DagTask.depends`                              |
| `simpleTag({ task: new WorkflowStep('wf_step', {}) result?: TaskResult.Failed })`                        | `{{wf_step.Failed}}`                              | This is only used in `WorkflowStep.depends`                         |
| `simpleTag({ task: new DagTask('dag_task', {}) })`                                                       | `{{dag_task}}`                                    | This is only used in `DagTask.depends`                              |
| `simpleTag({ task: new WorkflowStep('wf_step', {})})`                                                    | `{{wf_step}}`                                     | This is only used in `WorkflowStep.depends`                         |
| `simpleTag({ dagTask: new DagTask('dag_task', {}), output: new OutputArtifact('out_art') })`             | `{{tasks.dag_task.outputs.artifacts.out_art}}`    |                                                                     |
| `simpleTag({ dagTask: new DagTask('dag_task', {}), output: new OutputParameter('out_param') })`          | `{{tasks.dag_task.outputs.parameters.out_param}}` |                                                                     |
| `simpleTag({ dagTask: new DagTask('dag_task', {}), output: new OutputResult() })`                        | `{{tasks.dag_task.outputs.parameters.result}}`    |                                                                     |
| `simpleTag({ dagTask: new DagTask('dag_task', {}), output: 'id' })`                                      | `{{tasks.dag_task.outputs.id}}`                   | Useful when using built-in properties                               |
| `simpleTag({ dagTaskName: 'dag_task', output: new OutputArtifact('out_art') })`                          | `{{tasks.dag_task.outputs.artifacts.out_art}}`    | Useful when dealing with nested tasks inside a hook                 |
| `simpleTag({ dagTaskName: 'dag_task', output: new OutputParameter('out_param') })`                       | `{{tasks.dag_task.outputs.parameters.out_param}}` | Useful when dealing with nested tasks inside a hook                 |
| `simpleTag({ dagTaskName: 'dag_task', output: new OutputResult() })`                                     | `{{tasks.dag_task.outputs.parameters.result}}`    | Useful when dealing with nested tasks inside a hook                 |
| `simpleTag({ dagTaskOutputParameter: new DagTask('dag_task', {}) })`                                     | `{{tasks.dag_task.outputs.parameters}}`           |                                                                     |
| `simpleTag({ workflowStep: new WorkflowStep('wf_step', {}), output: new OutputArtifact('out_art') })`    | `{{steps.wf_step.outputs.artifacts.out_art}}`     |                                                                     |
| `simpleTag({ workflowStep: new WorkflowStep('wf_step', {}), output: new OutputParameter('out_param') })` | `{{steps.wf_step.outputs.parameters.out_param}}`  |                                                                     |
| `simpleTag({ workflowStep: new WorkflowStep('wf_step', {}), output: new OutputResult() })`               | `{{steps.wf_step.outputs.parameters.result}}`     |                                                                     |
| `simpleTag({ workflowStep: new WorkflowStep('wf_step', {}), output: 'id' })`                             | `{{steps.wf_step.id}}`                            | Useful when using built-in properties                               |
| `simpleTag({ workflowStepName: 'wf_step', output: new OutputArtifact('out_art') })`                      | `{{steps.wf_step.outputs.artifacts.out_art}}`     | Useful when dealing with nested steps inside a hook                 |
| `simpleTag({ workflowStepName: 'wf_step', output: new OutputParameter('out_param') })`                   | `{{steps.wf_step.outputs.parameters.out_param}}`  | Useful when dealing with nested steps inside a hook                 |
| `simpleTag({ workflowStepName: 'wf_step', output: new OutputResult() })`                                 | `{{steps.wf_step.outputs.parameters.result}}`     | Useful when dealing with nested steps inside a hook                 |
| `simpleTag({ workflowStepOutputParameter: new WorkflowStep('wf_step', {}) })`                            | `{{tasks.dag_task.outputs.parameters}}`           |                                                                     |
| `simpleTag({ pathResult: new OutputParameter('output_param', {})})`                                      | `{{outputs.parameters.output_param.path}}`        |                                                                     |
| `simpleTag({ pathResult: new OutputArtifact('out_art')})`                                                | `{{outputs.artifacts.out_art.path}}`              |                                                                     |
| `simpleTag({ pathResult: new InputArtifact('input_art', {})})`                                           | `{{inputs.artifacts.input_art.path}}`             |                                                                     |
| `simpleTag({ workflowOutput: new OutputParameter('output_param', { globalName: 'global_param'})})`       | `{{ workflow.outputs.parameters.global_param }}`  |                                                                     |
| `simpleTag({ workflowOutput: new OutputArtifact('out_art', { globalName: 'global_art'})})`               | `{{ workflow.outputs.artifacts.global_art }}`     |                                                                     |
| `simpleTag(new FromItemProperty('item_key'))`                                                            | `{{item.item_key}}`                               |                                                                     |
| `simpleTag(new FromItemProperty())`                                                                      | `{{item}}`                                        |                                                                     |

## Parameters and Artifacts
Objects that represent either a parameter or an artifact do no require use a `simpletag()` These objects have `valueFromExpressionArgs` as a property on the objects that removes the need for it.

## Expression Template Tag
Expression Tags use the `{{=}}`. Expression tags are substituted with the result of evaluating tag as an expression. Currently, Juno only has a few functions used with template

This function wraps a string in the expression template tags
```ts
export function expressionTag(input: string): string {}

// an example that would return "{{=inputs.parameters.test}}"
expressionTag("inputs.parameters.test");
```

This function ensures that hyphenated parameters are handled correctly inside an expression template tag. IE `inputs.parameters.my-param` will fail. `inputs.parameters['my-param']` must be used instead
```ts
export function hyphenParameter(input: ExpressionArgs): string {}

// a test for hyphenParameter()
expect(hyphenParameter(new InputArtifact('A-A', {}))).to.equal("inputs.artifacts['A-A']")
```

There are also a few logical operators functions
```ts
export function and(inputs: (string | ExpressionArgs)[]): string {}

// a test for and()
const dagTaskA = new DagTask('A', {});
const dagTaskB = new DagTask('B', {});
expect(and([dagTaskA, dagTaskB])).to.equal('A && B');
```



```ts
export function or(inputs: (string | ExpressionArgs)[]): string {}

// a test for or()
const dagTaskA = new DagTask('A', {});
const dagTaskB = new DagTask('B', {});
expect(or([dagTaskA, dagTaskB])).to.equal('A || B');
```

```ts
export function not(input: string | ExpressionArgs): string {}

// The test for not()
const dagTaskA = new DagTask('A', {});
expect(`${not(dagTaskA)}`).to.equal('!A');
```


```ts
export function paren(input: string): string {}

// a test for paren
expect(paren('A')).to.equal('( A )');
```

These operators are useful with `when` and `depends`

