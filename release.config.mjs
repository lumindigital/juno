/** @type {import('semantic-release').GlobalConfig} */
export default {
    branches: ['main'],
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'conventionalcommits',
            },
        ],
        ['@semantic-release/npm'],
        [
            '@semantic-release/github',
            {
                assets: [],
            },
        ],
    ],
};
