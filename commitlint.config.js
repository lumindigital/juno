export default {
    extends: ['@commitlint/config-angular'],
    ignores: [(message) => /^^build\(.+\): bump .+ from .+ to .+$/m.test(message)],
};
