import { Container } from '../../src/api/container';
import { Outputs } from '../../src/api/outputs';
import { OutputParameter } from '../../src/api/parameter';
import { ParameterValueFrom } from '../../src/api/parameter-value-from';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const helloOutputParameter = new OutputParameter('hello', {
        valueFrom: new ParameterValueFrom({
            path: '/tmp/hello_world.txt',
        }),
    });

    const worldToFileTemplate = new Template('world-to-file', {
        container: new Container({
            args: ['echo world > /tmp/hello_world.txt'],
            command: ['sh', '-c'],
            image: 'busybox',
        }),
        memoize: {
            cache: {
                configMap: {
                    key: 'cache-key',
                    name: 'cache-config',
                },
            },
            key: 'cache-key',
            maxAge: '10s',
        },
        outputs: new Outputs({
            parameters: [helloOutputParameter],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'memoized-',
        },
        spec: new WorkflowSpec({
            entrypoint: worldToFileTemplate,
        }),
    }).toWorkflow();
}
