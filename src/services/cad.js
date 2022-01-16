//import config from '../config.json';

import project_tree from '../data/project-tree.json';
import components_tree from '../data/components-tree.json';
import svg_as_json from '../data/svg-as-json.json';
import tabs_menu from '../data/tabs-menu.json';

const models = require.context('../data/files', true).keys()
    .map((key) => {
        const fileName = key.replace('./', '');
        const resource = require(`../data/files/${fileName}`);
        return { [fileName]: JSON.parse(JSON.stringify(resource)) }
    }).reduce((acc, curr) => { return { ...acc, ...curr } }, {})

// const req = async (route, options) => {
//     const response = await fetch(config.API_ENDPOINT + route, options);
//     return await response.json();
// }

const getComponentsTree = async () => {
    //const response = await req('/components_tree', { headers: { 'Content-Type': 'application/json' } });
    const response = components_tree
    return response;
};

const getSvgAsJson = async () => {
    //const response = await req('/components', { headers: { 'Content-Type': 'application/json' } });
    const response = svg_as_json
    return response;
};

const getProjectTree = async () => {
    //const response = await req('/project_tree', { headers: { 'Content-Type': 'application/json' } });
    const response = project_tree
    return response;
};

const getTabsMenu = async () => {
    //const response = await req('/project_tree', { headers: { 'Content-Type': 'application/json' } });
    const response = tabs_menu
    return response;
};

const getModelFromFileName = async (fileName) => {
    let response = null
    if (Object.keys(models).includes(fileName)) {
        response = models[fileName]
    } else {
        response = models[Object.keys(models)[0]]
    }
    return response;
};

export {
    getComponentsTree,
    getSvgAsJson,
    getProjectTree,
    getModelFromFileName,
    getTabsMenu
}

