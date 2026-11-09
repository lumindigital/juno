import {
    IoK8SApiCoreV1PodResourceClaim,
    IoK8SApiCoreV1ResourceRequirements,
} from '../workflow-interfaces/data-contracts.js';

/**
 * Validates pod-level resources the same way the Argo Workflows controller does.
 * Kubernetes only accepts cpu, memory and hugepages-* at the pod level, and no claims.
 * Anything else would be accepted on submission and then rejected by the API server
 * when the pod is created, part way through the workflow.
 */
export function validatePodResources(errPrefix: string, resources?: IoK8SApiCoreV1ResourceRequirements): void {
    if (!resources) {
        return;
    }

    if (resources.claims && resources.claims.length > 0) {
        throw new Error(`${errPrefix}.claims is not supported for pod-level resources`);
    }

    for (const list of [resources.limits, resources.requests]) {
        for (const name of Object.keys(list ?? {})) {
            if (name !== 'cpu' && name !== 'memory' && !name.startsWith('hugepages-')) {
                throw new Error(
                    `${errPrefix}: "${name}" is not a valid pod-level resource, only cpu, memory and hugepages-* are supported`,
                );
            }
        }
    }
}

/**
 * Kubernetes requires every pod resource claim to name exactly one source: an existing
 * ResourceClaim or a ResourceClaimTemplate. A claim with neither or both is rejected
 * by the API server when the pod is created.
 */
export function validateResourceClaimSources(errPrefix: string, claims?: IoK8SApiCoreV1PodResourceClaim[]): void {
    for (const claim of claims ?? []) {
        const sources = [claim.resourceClaimName, claim.resourceClaimTemplateName].filter((x) => x);
        if (sources.length !== 1) {
            throw new Error(
                `${errPrefix}.${claim.name} must set exactly one of resourceClaimName or resourceClaimTemplateName`,
            );
        }
    }
}
