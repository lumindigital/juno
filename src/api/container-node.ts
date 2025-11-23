import {
    IoK8SApiCoreV1EnvFromSource,
    IoK8SApiCoreV1Lifecycle,
    IoK8SApiCoreV1Probe,
    IoK8SApiCoreV1ContainerPort,
    IoK8SApiCoreV1ContainerResizePolicy,
    IoK8SApiCoreV1ResourceRequirements,
    IoK8SApiCoreV1SecurityContext,
    IoK8SApiCoreV1VolumeDevice,
    IoK8SApiCoreV1VolumeMount,
    IoArgoprojWorkflowV1Alpha1ContainerNode,
} from '../workflow-interfaces/data-contracts.js';
import { EnvironmentVariable } from './environment-variable.js';

export class ContainerNode {
    args?: string[];
    command?: string[];
    dependencies?: ContainerNode[];
    env?: EnvironmentVariable[];
    envFrom?: IoK8SApiCoreV1EnvFromSource[];
    image?: string;
    imagePullPolicy?: string;
    lifecycle?: IoK8SApiCoreV1Lifecycle;
    livenessProbe?: IoK8SApiCoreV1Probe;
    readonly name: string;
    ports?: IoK8SApiCoreV1ContainerPort[];
    readinessProbe?: IoK8SApiCoreV1Probe;
    resizePolicy?: IoK8SApiCoreV1ContainerResizePolicy[];
    resources?: IoK8SApiCoreV1ResourceRequirements;
    restartPolicy?: string;
    securityContext?: IoK8SApiCoreV1SecurityContext;
    startupProbe?: IoK8SApiCoreV1Probe;
    stdin?: boolean;
    stdinOnce?: boolean;
    terminationMessagePath?: string;
    terminationMessagePolicy?: string;
    tty?: boolean;
    volumeDevices?: IoK8SApiCoreV1VolumeDevice[];
    volumeMounts?: IoK8SApiCoreV1VolumeMount[];
    workingDir?: string;

    constructor(name: string, init?: Partial<ContainerNode>) {
        Object.assign(this, init);
        this.name = name;
    }

    toContainerNode(): IoArgoprojWorkflowV1Alpha1ContainerNode {
        return {
            args: this.args,
            command: this.command,
            dependencies: this.dependencies?.map((d) => d.name),
            env: this.env?.map((x) => x.toEnvironmentVariable()),
            envFrom: this.envFrom,
            image: this.image,
            imagePullPolicy: this.imagePullPolicy,
            lifecycle: this.lifecycle,
            livenessProbe: this.livenessProbe,
            name: this.name,
            ports: this.ports,
            readinessProbe: this.readinessProbe,
            resizePolicy: this.resizePolicy,
            resources: this.resources,
            restartPolicy: this.restartPolicy,
            securityContext: this.securityContext,
            startupProbe: this.startupProbe,
            stdin: this.stdin,
            stdinOnce: this.stdinOnce,
            terminationMessagePath: this.terminationMessagePath,
            terminationMessagePolicy: this.terminationMessagePolicy,
            tty: this.tty,
            volumeDevices: this.volumeDevices,
            volumeMounts: this.volumeMounts,
            workingDir: this.workingDir,
        };
    }
}
