export default {
    extends: ['@commitlint/config-conventional'],
    ignores: [(message) => /^^build\(.+\): bump .+ from .+ to .+$/m.test(message)],
};
