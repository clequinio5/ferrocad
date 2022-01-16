import DxfParser from 'dxf-parser';
import svgAsJson from "../data/dxf-svg-as-json";

let lastId = 0;

const generateId = (prefix = 'id') => {
    lastId++;
    return `${prefix}-${lastId}`;
}

const uuid = () => {
    return Math.random()
};

const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    })
}

const convertDxfToJointJsModel = (dxf) => {

    const dxfParser = new DxfParser();
    let jsonDxf
    try {
        jsonDxf = dxfParser.parseSync(dxf);
    } catch (err) {
        return console.error(err.stack);
    }

    console.log(jsonDxf);

    const dxfElements = jsonDxf.entities.filter(e => e.type === "INSERT");
    const dxfTexts = jsonDxf.entities.filter(e => e.type === "TEXT");
    const dxfMTexts = jsonDxf.entities.filter(e => e.type === "MTEXT");
    const dxfLines = jsonDxf.entities.filter(e => e.type === "LINE");
    const dxfPolyLines = jsonDxf.entities.filter(e => e.type === "LWPOLYLINE");

    console.log(dxfElements);

    let cells = [];
    for (const dxfElement of dxfElements) {
        let cell = Object.assign({}, svgAsJson[dxfElement.name] ? svgAsJson[dxfElement.name] : svgAsJson["default"]);
        let decal_x = Math.floor(cell.size.width / 2);
        let decal_y = Math.floor(cell.size.height / 2);
        cell.position = { "x": dxfElement.position.x * 5 - 2700 - decal_x, "y": dxfElement.position.y * -5 + 1800 - decal_y };
        cell.name = dxfElement.name;
        cell.id = uuid();
        if (dxfElement.name === "accol3" || dxfElement.name === "G_D") {
            //cherche du texte associé dans MText grâce au ownerHandle
            for (const dxfMText of dxfMTexts) {
                if (Math.pow(dxfElement.position.x - dxfMText.position.x, 2) + Math.pow(dxfElement.position.y - dxfMText.position.y, 2) < 80) {
                    cell.attrs = {
                        "label": {
                            "textWrap": { "text": dxfMText.text, "width": 260, "height": 60 },
                            "fill": "#b38600",
                            "text-decoration": "underline",
                            "refY": -15,
                        }
                    };
                    cell.attrs.body = svgAsJson["accol3"].attrs.body;
                }
            }
        }
        cells.push(cell);
    }

    for (const dxfText of dxfTexts) {
        let cell = Object.assign({}, svgAsJson["text"]);
        cell.attrs = { "label": { "text": dxfText.text, "fill": "#b38600" } };
        cell.attrs.body = {
            "fill": "none",
            "stroke": "transparent",
            "strokeWidth": 4,
            "rx": 10,
            "ry": 10
        };
        console.log(cell.size.width);
        let decal_x = Math.floor(cell.size.width / 2);
        let decal_y = Math.floor(cell.size.height / 2);
        cell.position = { "x": dxfText.startPoint.x * 5 - 2700 + decal_x, "y": dxfText.startPoint.y * -5 + 1800 };
        cell.id = uuid();
        cells.push(cell);
    }


    for (const dxfLine of dxfLines) {

        if (dxfLine.vertices[0].x === dxfLine.vertices[1].x) {
            let cell = Object.assign({}, svgAsJson["ligne vertical"]);
            cell.position = { "x": dxfLine.vertices[0].x * 5 - 2700, "y": Math.max(dxfLine.vertices[0].y, dxfLine.vertices[1].y) * -5 + 1800 };
            cell.size = { "width": 1, "height": Math.sqrt(Math.pow(dxfLine.vertices[0].y - dxfLine.vertices[1].y, 2)) * 5 };
            cell.id = uuid();
            cells.push(cell);
        } else if (dxfLine.vertices[0].y === dxfLine.vertices[1].y) {
            let cell = Object.assign({}, svgAsJson["ligne horizontal"]);
            cell.position = { "x": Math.min(dxfLine.vertices[0].x, dxfLine.vertices[1].x) * 5 - 2700, "y": dxfLine.vertices[0].y * -5 + 1800 };
            cell.size = { "width": Math.sqrt(Math.pow(dxfLine.vertices[0].x - dxfLine.vertices[1].x, 2)) * 5, "height": 1 };
            cell.id = uuid();
            cells.push(cell);
        } else {
        }
    }

    console.log(cells)

    const jointJsModel = { cells: cells }

    return jointJsModel

};

const deepMergeObj = (...objects) => {
    const isObject = obj => obj && typeof obj === 'object';
    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];
            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            }
            else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = deepMergeObj(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}

const treeToPaths = (tree) => {
    const paths = []
    const visitNode = (node, currPath = '') => {
        currPath = currPath + '/' + node.key
        if (node.children && node.children.length > 0) {
            node.children.some((child) => { visitNode(child, currPath) })
        } else {
            paths.push({ node, currPath })
        }
    }
    visitNode(tree)
    return paths
}

const searchTree = (tree, nodeKey) => {
    let temp;
    return tree.key === nodeKey ? tree : (tree.children || []).some(o => temp = searchTree(o, nodeKey)) && temp;
};

const getNode = (tree, nodeKey) => {
    const root = { key: "root", children: tree }
    const result = searchTree(root, nodeKey)
    return result
}

const walkTree = (data, key, callback) => {
    data.forEach((item, index, arr) => {
        if (item.key === key) {
            return callback(item, index, arr);
        }
        if (item.children) {
            return walkTree(item.children, key, callback);
        }
    });
};


export {
    convertDxfToJointJsModel,
    generateId,
    readFileAsync,
    deepMergeObj,
    getNode,
    walkTree,
    treeToPaths
}