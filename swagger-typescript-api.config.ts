// Configuration for `npm run interfaces` (swagger-typescript-api).
// Kubernetes and Argo encode `format: byte` fields as base64 strings in YAML/JSON,
// so keep them typed as `string` instead of the generator's default `Blob`.
export default {
    primitiveTypeConstructs: () => ({
        string: {
            byte: () => 'string',
        },
    }),
};
