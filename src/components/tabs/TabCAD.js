import React from 'react';
import { Tabs, Button, message } from 'antd';
import SplitPane from 'react-split-pane';
import moment from 'moment';

import '../../styles/TabCAD.scss'

import PaneProjectTree from '../cad/PaneProjectTree';
import PaneComponentTree from '../cad/PaneComponentTree';
import PaneComponentProperties from '../cad/PaneComponentProperties';
import PaneLog from '../cad/PaneLog';
import TabFactory from '../cad/TabFactory';
import MenuCAD from '../cad/MenuCAD';

import { convertDxfToJointJsModel, readFileAsync } from '../../helpers/utils';
import { sharedProp } from '../../helpers/decorator';

import da_parameters_1 from '../../data/da-parameters/da-parameters-1.json'
import da_parameters_2 from '../../data/da-parameters/da-parameters-2.json'
import da_parameters_3 from '../../data/da-parameters/da-parameters-3.json'
import da_parameters_4 from '../../data/da-parameters/da-parameters-4.json'
import da_parameters_5 from '../../data/da-parameters/da-parameters-5.json'

import { getProjectTree, getModelFromFileName } from '../../services/cad';


@sharedProp('paneLogItems')
@sharedProp('selectedComponentProperties')
class TabCAD extends React.Component {

    constructor(props) {
        super(props)
        const initTabs = [
            TabFactory('Diagram - Exemple1', da_parameters_1),
            TabFactory('Diagram - Exemple2', da_parameters_2),
            TabFactory('Diagram - Exemple3', da_parameters_3),
            TabFactory('Diagram - Exemple4', da_parameters_4),
            TabFactory('Diagram - Exemple5', da_parameters_5),
        ]
        this.state = { tabs: initTabs, activeTab: initTabs[initTabs.length - 1], projectTreeData: [] }
        this.keyActions = {
            "ctrl+s": () => { this.onExportClick() }
        }
        this.setStateAsync = (state) => new Promise((resolve) => this.setState(state, resolve));
    }

    componentDidMount = async () => {
        document.addEventListener("keydown", this.onKeyDown);
        const projectTree = await getProjectTree();
        this.setState({ projectTreeData: projectTree });
    }

    componentWillUnmount = () => {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (event.ctrlKey || event.metaKey) {
            const ctrlChar = Object.keys(this.keyActions).map(key => key.split('+')[1])
            if (ctrlChar.includes(event.key)) {
                event.preventDefault();
                this.keyActions["ctrl+" + event.key]()
            }
        }
    }

    onChange = (nActiveTabKey) => {
        const nActiveTab = this.state.tabs.find(tab => tab.tabKey === nActiveTabKey)
        this.setState({ activeTab: nActiveTab })
        this.props.log(moment().toISOString() + ' - Change tab to ' + nActiveTab.title)
        this.props.setSelectedComponentProperties({})
    };

    onEdit = (targetTabKey, action) => {
        if (action === 'remove') {
            this.removeTab(targetTabKey)
        }
    };

    removeTab = (tabKeyToRemove) => {
        const { tabs } = this.state
        const nTabs = tabs.length > 1 ? [...tabs].filter(tab => tab.tabKey !== tabKeyToRemove) : []
        const nActiveTab = tabs.length > 1 ? nTabs[nTabs.length - 1] : null
        this.setState({
            tabs: nTabs,
            activeTab: nActiveTab
        })
    };

    addTab = async (tabTitle = "New Diagram", projectKey = "") => {
        const nTabs = [...this.state.tabs, TabFactory(tabTitle, undefined, projectKey)]
        const nActiveTab = nTabs[nTabs.length - 1]
        await this.setStateAsync({
            tabs: nTabs,
            activeTab: nActiveTab
        })
    }

    addTabAndLoadModel = async (tabTitle, model, projectKey = "") => {
        try {
            await this.addTab(tabTitle, projectKey)
            const activeGraph = this.state.activeTab.ref.current.graph
            activeGraph.fromJSON(model)
        } catch (error) {
            throw new Error(error)
        }
    }

    openFileFromProjectTree = async (projectTreeNode) => {
        const { title, file, key } = projectTreeNode
        const isAlreadyOpened = this.state.tabs.find(tab => tab.projectKey === key)
        if (isAlreadyOpened) {
            this.setState({ activeTab: isAlreadyOpened })
            this.props.log(moment().toISOString() + ' - Change tab to ' + key)
        } else {
            const model = await getModelFromFileName(file)
            this.addTabAndLoadModel(title, model, key)
            this.props.log(moment().toISOString() + ' - Load model ' + key + ' in new tab')
        }
    };

    onExportClick = () => {
        const activeGraph = this.state.activeTab.ref.current.graph
        const model = JSON.stringify(activeGraph.toJSON(), null, 4);
        const link = document.createElement('a');
        link.href = "data:application/json;charset=utf-u," + encodeURIComponent(model);
        link.download = moment().format('YYYYMMDDHHmmss') + ".ferrocad";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    onImportClick = async (file) => {
        try {
            const jsonText = await readFileAsync(file);
            const importedModel = JSON.parse(jsonText);
            this.addTabAndLoadModel(file.name, importedModel)
            message.info("Le fichier " + file.name + " a bien été importé", 2, () => { });
        } catch (error) {
            message.error("Une erreur s'est produite lors de l'import", 2, () => { })
        }
        return false
    }

    onImportDXFClick = async (file) => {
        const dxf = await readFileAsync(file);
        const importedModel = convertDxfToJointJsModel(dxf);
        this.addTabAndLoadModel(file.name, importedModel)
        return false
    }

    render = () => {
        return (
            <div className="Tab TabCAD">
                <div className="MenuCAD" >
                    <MenuCAD
                        onExportClick={this.onExportClick}
                        onImportClick={this.onImportClick}
                        onImportDXFClick={this.onImportDXFClick}
                    />
                </div>
                <div className="SplitPane">
                    <SplitPane minSize={160} defaultSize={200} maxSize={400} split="vertical" >
                        <SplitPane primary="second" minSize={100} defaultSize={"80%"} maxSize={-50} pane2Style={{ display: 'block' }} split="horizontal">
                            <PaneProjectTree data={this.state.projectTreeData} selectedKeys={this.state.activeTab ? [this.state.activeTab.projectKey] : []} openFileFromProjectTree={this.openFileFromProjectTree} />
                            <PaneComponentProperties data={this.state.projectTreeData} />
                        </SplitPane>
                        <SplitPane primary="second" minSize={100} defaultSize={120} maxSize={-50} split="horizontal" >
                            <SplitPane minSize={160} defaultSize={"80%"} maxSize={-160} split="vertical">
                                {this.state.tabs.length > 0 ? <Tabs
                                    style={{ width: "auto" }}
                                    hideAdd
                                    tabBarGutter={0}
                                    onChange={this.onChange}
                                    activeKey={this.state.activeTab.tabKey}
                                    type="editable-card"
                                    className="TabsPane"
                                    onEdit={this.onEdit}
                                >
                                    {this.state.tabs.map(({ title, tabKey, content, ref }) =>
                                        <Tabs.TabPane tab={title} key={tabKey}>
                                            <content.type {...content.props} tabKey={tabKey} ref={ref} />
                                        </Tabs.TabPane>
                                    )}
                                </Tabs> : <div className='NoTabButton'><Button type='primary' icon='plus' onClick={() => this.addTab()} /></div>}
                                <PaneComponentTree className="PaneComponentTree" />
                            </SplitPane>
                            <PaneLog />
                        </SplitPane>
                    </SplitPane>
                </div>
            </div>
        )
    }

}


export default TabCAD;