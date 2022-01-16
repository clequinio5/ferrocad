import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Layout } from 'antd';

import '../styles/App.scss';

import TabsMenu from './TabsMenu';
import TabCAD from './tabs/TabCAD';
import TabUser from './tabs/TabUser';
import TabDefault from './tabs/TabDefault';

import { getTabsMenu } from '../services/cad';

const MenuMap = {
  'user': TabUser,
  'cad': TabCAD,
}

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      tabsMenu: [],
      tabMenuSelectedKey: []
    }
  }

  componentDidMount = async () => {
    const tabsMenu = await getTabsMenu()
    const tabMenuSelectedKey = window.location.pathname === '/' ? [tabsMenu[0].key] : [window.location.pathname.replace('/', '')]
    this.setState({
      tabsMenu,
      tabMenuSelectedKey
    })
  }

  onTabMenuSelectedChange = (e) => {
    const nTabMenuSelectedKey = e.selectedKeys
    this.setState({ tabMenuSelectedKey: nTabMenuSelectedKey })
  }

  render = () => {
    return (
      <Layout>
        <Layout.Header className="Header">
          <div className="AppLogo" />
          <div className="AppName">FERROCAD</div>
        </Layout.Header>
        {this.state.tabsMenu.length > 0 &&
          <Layout >
            <TabsMenu selectedKeys={this.state.tabMenuSelectedKey} menuItems={this.state.tabsMenu} onTabMenuSelectedChange={this.onTabMenuSelectedChange} />
            <Layout >
              <Layout.Content >
                {this.state.tabsMenu.map(tab => <Route key={tab.key} path={"/" + tab.key} component={MenuMap[tab.key] || TabDefault} />)}
                <Route exact path="/"><Redirect to={"/" + this.state.tabsMenu[0].key} /></Route>
              </Layout.Content>
            </Layout>
          </Layout>}
      </Layout >
    )
  }
}

export default App
