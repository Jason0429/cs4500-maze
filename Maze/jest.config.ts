const config = {
    verbose: true,
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    modulePathIgnorePatterns: ['build/*', 'observer-gui/*']
};
export default config;
