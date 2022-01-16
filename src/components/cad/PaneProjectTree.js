import React from 'react';
import { Tree } from 'antd';
import { getNode, walkTree } from '../../helpers/utils';


class ProjectTree extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            expandedKeys: [],
            treeData: props.data,
            selectedKeys: props.selectedKeys
        }
    }

    componentWillReceiveProps(props) {
        this.setState({ treeData: props.data, selectedKeys: props.selectedKeys });
    }

    onSelect = (selectedKeys) => {
        if (selectedKeys.length === 1) {
            const [projectTreeNodeKey] = selectedKeys
            const nodeClicked = getNode(this.state.treeData, projectTreeNodeKey)
            this.props.openFileFromProjectTree(nodeClicked);
            this.setState({ selectedKeys })
        }
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

    buildUITree = (jsonTree) => {
        const uiTree = []
        for (const node of jsonTree) {
            if (node.children && node.children.length > 0) {
                uiTree.push(
                    <Tree.TreeNode
                        className="ProjectTreeNode"
                        key={node.key}
                        title={node.title}
                        selectable={false}>
                        {this.buildUITree(node.children)}
                    </Tree.TreeNode>
                )
            } else {
                uiTree.push(
                    <Tree.TreeNode
                        className="ProjectTreeNode"
                        key={node.key}
                        title={node.title}
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
                    PROJECT TREE
                </div>
                <div className="PaneBoxContent">
                    {this.state.treeData ?
                        <Tree.DirectoryTree
                            defaultExpandedKeys={this.state.expandedKeys}
                            draggable
                            multiple
                            onSelect={this.onSelect}
                            selectedKeys={this.state.selectedKeys}
                            showIcon={true}
                            onDrop={this.onDrop}
                        >
                            {this.buildUITree(this.state.treeData)}
                        </Tree.DirectoryTree > : null}
                </div>
            </>
        );
    }
}

export default ProjectTree;