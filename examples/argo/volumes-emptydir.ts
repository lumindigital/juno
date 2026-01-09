import { Container } from '../../src/api/container';
import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const volumesEmptyDirExampleTemplate = new Template('volumes-emptydir-example', {
        container: new Container({
            args: [
                ' vol_found=`mount | grep /mnt/vol` && if [[ -n $vol_found ]]; then echo "Volume mounted and found"; else echo "Not found"; fi',
            ],
            command: ['/bin/bash', '-c'],
            image: 'debian:latest',
            volumeMounts: [
                {
                    mountPath: '/mnt/vol',
                    name: 'workdir',
                },
            ],
        }),
    });

    return new Workflow({
        metadata: {
            generateName: 'volumes-emptydir-',
        },
        spec: new WorkflowSpec({
            entrypoint: volumesEmptyDirExampleTemplate,
            volumes: [
                {
                    emptyDir: {},
                    name: 'workdir',
                },
            ],
        }),
    }).toWorkflow();
}
