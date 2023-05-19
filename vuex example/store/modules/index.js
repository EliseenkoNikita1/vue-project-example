import camelCase from 'lodash/camelCase';
const requireModule = require.context(
    '.',
    true,
    /^(?!.*(actions|mutations|getters|index)).*\.js$/
);

const modules = {};

requireModule.keys().forEach(fileName => {
    let first = (camelCase(fileName.split('/')[1].replace(/(\.\/|\.js)/g, '')));
    let second = (camelCase(fileName.split('/')[2].replace(/(\.\/|\.js)/g, '')));
    if (first == second) {
        modules[camelCase(fileName.split('/')[1].replace(/(\.\/|\.js)/g, ''))] = {
            namespaced: true,
            ...requireModule(fileName).default
        };
    }
});

export default modules;