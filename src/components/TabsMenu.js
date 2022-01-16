import React from 'react';
import { Link } from "react-router-dom";
import { Layout, Menu, Icon } from 'antd';

const TabsMenu = ({ onTabMenuSelectedChange, menuItems, selectedKeys }) => {

    return (
        <Layout.Sider
            collapsible={false}
            defaultCollapsed={true}
            collapsedWidth={80}
        >
            <Menu className="Menu" theme="dark" mode="inline" multiple={false} selectedKeys={selectedKeys} onSelect={onTabMenuSelectedChange}>
                {menuItems.map(item =>
                    <Menu.Item key={item.key} title={item.text}>
                        <Icon type={item.icon} />
                        <Link to={"/" + item.key} />
                    </Menu.Item>
                )}
            </Menu>
        </Layout.Sider >

    );
}

export default TabsMenu;