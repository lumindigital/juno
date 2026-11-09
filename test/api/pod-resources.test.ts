import { expect } from 'chai';
import { Container } from '../../src/api/container';
import { ContainerNode } from '../../src/api/container-node';
import { ContainerSetTemplate } from '../../src/api/container-set-template';
import { CronWorkflowSpec } from '../../src/api/cron-workflow-spec';
import { DagTemplate } from '../../src/api/dag-template';
import { OutputArtifact } from '../../src/api/artifact';
import { Script } from '../../src/api/script';
import { Template, TemplateDefaults } from '../../src/api/template';
import { UserContainer } from '../../src/api/user-container';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { WorkflowStep } from '../../src/api/workflow-step';

const busybox = () => new Container({ command: ['echo'], image: 'busybox' });

describe('argo v4 fields', (): void => {
    describe('podResources', (): void => {
        it('emits workflow and template level podResources', (): void => {
            const template = new Template('main', {
                container: busybox(),
                podResources: { limits: { cpu: '2', memory: '1Gi' } },
            });

            const result = new WorkflowSpec({
                entrypoint: template,
                podResources: { requests: { cpu: '100m', 'hugepages-2Mi': '64Mi' } },
            }).toWorkflowSpec();

            expect(result.podResources).to.deep.equal({ requests: { cpu: '100m', 'hugepages-2Mi': '64Mi' } });
            expect(result.templates?.[0].podResources).to.deep.equal({ limits: { cpu: '2', memory: '1Gi' } });
        });

        it('fails when the workflow requests a resource that is not allowed at the pod level', (): void => {
            const spec = new WorkflowSpec({
                entrypoint: new Template('main', { container: busybox() }),
                podResources: { limits: { 'nvidia.com/gpu': '1' } },
            });

            expect(() => spec.toWorkflowSpec()).to.throw(
                'spec.podResources: "nvidia.com/gpu" is not a valid pod-level resource, only cpu, memory and hugepages-* are supported',
            );
        });

        it('fails when a template requests a resource that is not allowed at the pod level', (): void => {
            const template = new Template('main', {
                container: busybox(),
                podResources: { requests: { 'ephemeral-storage': '1Gi' } },
            });

            expect(() => template.toTemplate()).to.throw(
                'templates.main.podResources: "ephemeral-storage" is not a valid pod-level resource',
            );
        });

        it('fails when pod-level resources contain claims', (): void => {
            const template = new Template('main', {
                container: busybox(),
                podResources: { claims: [{ name: 'gpu' }] },
            });

            expect(() => template.toTemplate()).to.throw(
                'templates.main.podResources.claims is not supported for pod-level resources',
            );
        });

        it('fails on http and plugin templates, which run on the shared agent pod', (): void => {
            const http = new Template('call', {
                http: { url: 'https://example.com' },
                podResources: { limits: { cpu: '1' } },
            });
            const plugin = new Template('hello', {
                plugin: { hello: {} },
                podResources: { limits: { cpu: '1' } },
            });

            expect(() => http.toTemplate()).to.throw('templates.call.podResources is not supported for HTTP templates');
            expect(() => plugin.toTemplate()).to.throw(
                'templates.hello.podResources is not supported for Plugin templates',
            );
        });

        it('is validated on templates reached through the entrypoint', (): void => {
            const leaf = new Template('leaf', {
                container: busybox(),
                podResources: { limits: { 'example.com/foo': '1' } },
            });
            const spec = new WorkflowSpec({
                entrypoint: new Template('main', { steps: [[new WorkflowStep('leaf', { template: leaf })]] }),
            });

            expect(() => spec.toWorkflowSpec()).to.throw('templates.leaf.podResources: "example.com/foo"');
        });
    });

    describe('resourceClaims', (): void => {
        it('emits workflow and template level resourceClaims', (): void => {
            const template = new Template('main', {
                container: busybox(),
                resourceClaims: [{ name: 'gpu', resourceClaimName: 'shared-gpu' }],
            });

            const result = new WorkflowSpec({
                entrypoint: template,
                resourceClaims: [{ name: 'gpu', resourceClaimTemplateName: 'gpu-template' }],
            }).toWorkflowSpec();

            expect(result.resourceClaims).to.deep.equal([{ name: 'gpu', resourceClaimTemplateName: 'gpu-template' }]);
            expect(result.templates?.[0].resourceClaims).to.deep.equal([
                { name: 'gpu', resourceClaimName: 'shared-gpu' },
            ]);
        });

        it('is allowed on every template type that creates a pod', (): void => {
            const claims = [{ name: 'gpu', resourceClaimTemplateName: 'gpu-template' }];
            const templates = [
                new Template('container', { container: busybox(), resourceClaims: claims }),
                new Template('script', {
                    resourceClaims: claims,
                    script: new Script({ image: 'busybox', source: 'ls' }),
                }),
                new Template('resource', { resource: { action: 'create', manifest: '{}' }, resourceClaims: claims }),
                new Template('data', {
                    data: { source: { artifactPaths: { name: 'a' } }, transformation: [] },
                    resourceClaims: claims,
                }),
                new Template('container-set', {
                    containerSet: new ContainerSetTemplate({
                        containers: [new ContainerNode('a', { image: 'busybox' })],
                    }),
                    resourceClaims: claims,
                }),
            ];

            for (const template of templates) {
                expect(() => template.toTemplate(), template.name).to.not.throw();
            }
        });

        it('fails on templates that do not create a pod', (): void => {
            const claims = [{ name: 'gpu', resourceClaimTemplateName: 'gpu-template' }];
            const cases: [Template, string][] = [
                [new Template('steps', { resourceClaims: claims, steps: [] }), 'Steps'],
                [new Template('dag', { dag: new DagTemplate({ tasks: [] }), resourceClaims: claims }), 'DAG'],
                [new Template('suspend', { resourceClaims: claims, suspend: {} }), 'Suspend'],
                [new Template('http', { http: { url: 'https://example.com' }, resourceClaims: claims }), 'HTTP'],
                [new Template('plugin', { plugin: { hello: {} }, resourceClaims: claims }), 'Plugin'],
            ];

            for (const [template, type] of cases) {
                expect(() => template.toTemplate(), type).to.throw(
                    `templates.${template.name}.resourceClaims is not supported for ${type} templates, which do not create a pod`,
                );
            }
        });

        it('requires exactly one of resourceClaimName or resourceClaimTemplateName', (): void => {
            const neither = new Template('main', { container: busybox(), resourceClaims: [{ name: 'gpu' }] });
            const both = new Template('main', {
                container: busybox(),
                resourceClaims: [{ name: 'gpu', resourceClaimName: 'a', resourceClaimTemplateName: 'b' }],
            });

            const message =
                'templates.main.resourceClaims.gpu must set exactly one of resourceClaimName or resourceClaimTemplateName';
            expect(() => neither.toTemplate()).to.throw(message);
            expect(() => both.toTemplate()).to.throw(message);
        });

        it('requires exactly one source on workflow level claims', (): void => {
            const spec = new WorkflowSpec({
                entrypoint: new Template('main', { container: busybox() }),
                resourceClaims: [{ name: 'gpu' }],
            });

            expect(() => spec.toWorkflowSpec()).to.throw(
                'spec.resourceClaims.gpu must set exactly one of resourceClaimName or resourceClaimTemplateName',
            );
        });

        it('does not validate the template type of templateDefaults', (): void => {
            const defaults = new TemplateDefaults({
                resourceClaims: [{ name: 'gpu', resourceClaimTemplateName: 'gpu-template' }],
            });

            expect(() => defaults.toTemplate()).to.not.throw();
        });
    });

    describe('other new fields', (): void => {
        it('emits executorPlugins, pendingTimeout and template annotations', (): void => {
            const template = new Template('main', {
                annotations: { 'workflows.argoproj.io/display-name': 'Main' },
                container: busybox(),
                pendingTimeout: '5m',
            });
            const executorPlugins = [
                {
                    metadata: { name: 'hello' },
                    spec: { sidecar: { container: { image: 'hello:latest', name: 'hello' } } },
                },
            ];

            const result = new WorkflowSpec({ entrypoint: template, executorPlugins }).toWorkflowSpec();

            expect(result.executorPlugins).to.deep.equal(executorPlugins);
            expect(result.templates?.[0].pendingTimeout).to.equal('5m');
            expect(result.templates?.[0].annotations).to.deep.equal({ 'workflows.argoproj.io/display-name': 'Main' });
        });

        it('emits restartPolicyRules on every container type and resizePolicy on containers', (): void => {
            const restartPolicyRules = [{ action: 'Restart', exitCodes: { operator: 'In', values: [42] } }];
            const resizePolicy = [{ resourceName: 'cpu', restartPolicy: 'NotRequired' }];

            const container = new Container({
                image: 'busybox',
                resizePolicy,
                restartPolicy: 'Never',
                restartPolicyRules,
            });
            const script = new Script({ image: 'busybox', restartPolicyRules, source: 'ls' });
            const userContainer = new UserContainer('sidecar', { image: 'busybox', restartPolicyRules });
            const containerNode = new ContainerNode('node', { image: 'busybox', restartPolicyRules });

            expect(container.toContainer().restartPolicyRules).to.deep.equal(restartPolicyRules);
            expect(container.toContainer().resizePolicy).to.deep.equal(resizePolicy);
            expect(script.toScript().restartPolicyRules).to.deep.equal(restartPolicyRules);
            expect(userContainer.toUserContainer().restartPolicyRules).to.deep.equal(restartPolicyRules);
            expect(containerNode.toContainerNode().restartPolicyRules).to.deep.equal(restartPolicyRules);
        });

        it('emits plugin artifact locations', (): void => {
            const artifact = new OutputArtifact('out', {
                path: '/tmp/out',
                plugin: { configuration: 'bucket: b', key: 'out.txt', name: 'my-driver' },
            });

            expect(artifact.toArtifact('main').plugin).to.deep.equal({
                configuration: 'bucket: b',
                key: 'out.txt',
                name: 'my-driver',
            });
        });

        it('emits cron schedules', (): void => {
            const spec = new CronWorkflowSpec({
                schedules: ['0 2 * * *', '0 14 * * *'],
                workflowSpec: new WorkflowSpec({ entrypoint: new Template('main', { container: busybox() }) }),
            });

            expect(spec.toCronWorkflowSpec().schedules).to.deep.equal(['0 2 * * *', '0 14 * * *']);
        });
    });
});
