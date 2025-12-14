import {
    IoArgoprojWorkflowV1Alpha1ArchiveStrategy,
    IoArgoprojWorkflowV1Alpha1Artifact,
    IoArgoprojWorkflowV1Alpha1ArtifactGC,
    IoArgoprojWorkflowV1Alpha1ArtifactoryArtifact,
    IoArgoprojWorkflowV1Alpha1AzureArtifact,
    IoArgoprojWorkflowV1Alpha1GCSArtifact,
    IoArgoprojWorkflowV1Alpha1GitArtifact,
    IoArgoprojWorkflowV1Alpha1HDFSArtifact,
    IoArgoprojWorkflowV1Alpha1HTTPArtifact,
    IoArgoprojWorkflowV1Alpha1OSSArtifact,
    IoArgoprojWorkflowV1Alpha1RawArtifact,
    IoArgoprojWorkflowV1Alpha1S3Artifact,
} from '../workflow-interfaces/data-contracts.js';
import { ExpressionArgs, simpleTag } from './expression.js';

export class Artifact {
    archive?: IoArgoprojWorkflowV1Alpha1ArchiveStrategy;
    archiveLogs?: boolean;
    artifactGC?: IoArgoprojWorkflowV1Alpha1ArtifactGC;
    artifactory?: IoArgoprojWorkflowV1Alpha1ArtifactoryArtifact;
    azure?: IoArgoprojWorkflowV1Alpha1AzureArtifact;
    deleted?: boolean;
    from?: string;
    fromExpression?: string;
    gcs?: IoArgoprojWorkflowV1Alpha1GCSArtifact;
    git?: IoArgoprojWorkflowV1Alpha1GitArtifact;
    globalName?: string;
    hdfs?: IoArgoprojWorkflowV1Alpha1HDFSArtifact;
    http?: IoArgoprojWorkflowV1Alpha1HTTPArtifact;
    mode?: number;
    readonly name: string;
    optional?: boolean;
    oss?: IoArgoprojWorkflowV1Alpha1OSSArtifact;
    path?: string;
    raw?: IoArgoprojWorkflowV1Alpha1RawArtifact;
    recurseMode?: boolean;
    s3?: IoArgoprojWorkflowV1Alpha1S3Artifact;
    subPath?: string;
    valueFromExpressionArgs?: ExpressionArgs;

    constructor(name: string, init?: Partial<Artifact>) {
        this.name = name;
        Object.assign(this, init);
    }

    toArtifact(): IoArgoprojWorkflowV1Alpha1Artifact {
        this.validateMutuallyExclusive();

        let from;
        if (this.from) {
            from = this.from;
        } else if (this.valueFromExpressionArgs) {
            from = simpleTag(this.valueFromExpressionArgs);
        }

        return {
            archive: this.archive,
            archiveLogs: this.archiveLogs,
            artifactGC: this.artifactGC,
            artifactory: this.artifactory,
            azure: this.azure,
            deleted: this.deleted,
            from,
            fromExpression: this.fromExpression,
            gcs: this.gcs,
            git: this.git,
            globalName: this.globalName,
            hdfs: this.hdfs,
            http: this.http,
            mode: this.mode,
            name: this.name,
            optional: this.optional,
            oss: this.oss,
            path: this.path,
            raw: this.raw,
            recurseMode: this.recurseMode,
            s3: this.s3,
            subPath: this.subPath,
        };
    }

    validateMutuallyExclusive() {
        let count = 0;
        if (this.from || this.from === '') {
            count++;
        }

        if (this.fromExpression) {
            count++;
        }

        if (this.valueFromExpressionArgs) {
            count++;
        }

        if (count > 1) {
            throw new Error(`from, valueFromExpressionArgs, and fromExpression are mutually exclusive on ${this.name}`);
        }
    }
}

export class InputArtifact extends Artifact {
    readonly isInputArtifact = true;

    constructor(name: string, init?: Partial<Artifact>) {
        super(name, init);
    }

    toArgumentArtifact(init?: Partial<InputArtifact>): ArgumentArtifact {
        return new ArgumentArtifact(this.name, init);
    }
}

export class OutputResult {
    readonly isOutputResult = true;
}

export class OutputArtifact extends Artifact {
    readonly isOutputArtifact = true;

    constructor(name: string, init?: Partial<Artifact>) {
        super(name, init);
    }
}

export class ArgumentArtifact extends Artifact {
    readonly isArgument = true;
    constructor(name: string, init?: Partial<Artifact>) {
        super(name, init);
    }
}
