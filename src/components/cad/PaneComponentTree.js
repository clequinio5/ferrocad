import React from 'react';
import { Tree, Input, message } from 'antd';

import ImportButton from "../common/ImportButton"

import { walkTree, readFileAsync, treeToPaths } from '../../helpers/utils';

import { getComponentsTree, getSvgAsJson } from '../../services/cad';


class ComponentTree extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            treeData: [],
            svgAsJson: {},
            searchValue: '',
            autoExpandParent: true,
        }
    }

    componentDidMount = async () => {
        const treeData = await getComponentsTree()
        const treeDataAsPaths = treeToPaths({ key: '_', children: treeData })
        const svgAsJson = await getSvgAsJson()
        this.setState({ treeData, svgAsJson, treeDataAsPaths })
    }

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };

    onDragStart = (info) => {
        info.event.dataTransfer.setData(process.env.REACT_APP_DROP_COMPONENT_KEY, info.node.props.svgAsJsonObj);
    }

    onDragOver = info => {
        info.event.stopPropagation();
    }

    onDrop = (info) => {
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        const nTreeData = [...this.state.treeData];

        //Get dragged object and delete it from tree
        let dragObj;
        walkTree(nTreeData, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!info.dropToGap) {
            walkTree(nTreeData, dropKey, item => {
                item.children = item.children || [];
                item.children.push(dragObj);
            });
        } else if ((info.node.props.children || []).length > 0 && info.node.props.expanded && dropPosition === 1) {
            walkTree(nTreeData, dropKey, item => {
                item.children = item.children || [];
                item.children.unshift(dragObj);
            });
        } else {
            let ar;
            let i;
            walkTree(nTreeData, dropKey, (item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }

        this.setState({
            treeData: nTreeData,
        });
    };

    onSearchChange = (e) => {
        const nSearchValue = e.target.value;
        if (nSearchValue !== '') {
            const nodePaths = this.state.treeDataAsPaths
            const nExpandedKeys = nodePaths.map((nodePath) => {
                const { node, currPath } = nodePath
                if (node.title.toLowerCase().indexOf(nSearchValue.toLowerCase()) > -1) {
                    const expNodesKeys = currPath.split('/').slice(1, -1)
                    return expNodesKeys
                } else {
                    return []
                }
            }).reduce((acc, curr) => { return [...acc, ...curr] }, [])
                .filter((v, i, s) => s.indexOf(v) === i)

            this.setState({
                expandedKeys: nExpandedKeys,
                searchValue: nSearchValue,
                autoExpandParent: true,
            });
        } else {
            this.setState({
                expandedKeys: [],
                searchValue: nSearchValue
            })
        }

    };

    onAddComponentClick = async (file) => {
        try {
            const jsonText = await readFileAsync(file);
            const nComponents = JSON.parse(jsonText);
            console.log(nComponents)
            message.info("Le fichier " + file.name + " a bien été importé", 2, () => { });
        } catch (error) {
            message.error("Une erreur s'est produite lors de l'import du fichier " + file.name, 2, () => { })
        }
        return false;
    }

    buildUITree = (jsonTree, searchValue, svgAsJson) => {
        const uiTree = []
        for (const node of jsonTree) {

            const searchIndex = node.title.toLowerCase().indexOf(searchValue.toLowerCase());

            const beforeStr = node.title.substr(0, searchIndex);
            const highlightStr = node.title.substr(searchIndex, searchValue.length);
            const afterStr = node.title.substr(searchIndex + searchValue.length);
            const nTitle =
                searchIndex > -1 ? (
                    <span>
                        {beforeStr}
                        <span style={{ color: '#f50' }}>{highlightStr}</span>
                        {afterStr}
                    </span>
                ) : (
                    <span>{node.title}</span>
                );
            if (node.children && node.children.length > 0) {
                uiTree.push(
                    <Tree.TreeNode
                        className="ComponentTreeNode"
                        key={node.key}
                        title={nTitle}
                        selectable={false}>
                        {this.buildUITree(node.children, searchValue, svgAsJson)}
                    </Tree.TreeNode>
                )
            } else {
                const componentKey = Object.keys(svgAsJson).includes(node.key) ? node.key : 'default';
                let svgAsJsonObj = svgAsJson[componentKey];
                svgAsJsonObj.properties['@ key'] = componentKey;
                svgAsJsonObj.properties['@ title'] = node.title;
                svgAsJsonObj = JSON.stringify(svgAsJsonObj);
                uiTree.push(
                    <Tree.TreeNode
                        className="ComponentTreeNode"
                        key={node.key}
                        title={nTitle}
                        svgAsJsonObj={svgAsJsonObj}
                        isLeaf >
                    </Tree.TreeNode>
                )
            }
        }
        return uiTree
    }


    render = () => {
        return (
            <>
                <div className='PaneBoxHeader'>
                    COMPONENTS TREE
                    <div style={{ float: 'right' }}>
                        <ImportButton
                            onImport={this.onAddComponentClick}
                            accept=".json"
                            icon="download"
                        />
                    </div>
                </div>
                <Input.Search size="small" style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onSearchChange} />
                <div className="PaneBoxContent">
                    <Tree
                        onExpand={this.onExpand}
                        expandedKeys={this.state.expandedKeys}
                        draggable
                        style={{ overflowY: "auto", height: "360px" }}
                        onDragStart={this.onDragStart}
                        onDragOver={this.onDragOver}
                        autoExpandParent={this.state.autoExpandParent}
                    >
                        {this.buildUITree(this.state.treeData, this.state.searchValue, this.state.svgAsJson)}
                    </Tree>
                </div>
            </>
        );
    }
}

export default ComponentTree;