const Configuration = {
    extends: ['@commitlint/config-conventional'],
    ignores: [(message) => /^(build|ci)\(.+\): bump .+ from .+ to .+$/m.test(message)],
};

export default Configuration;
