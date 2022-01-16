const { override, fixBabelImports, addLessLoader, addDecoratorsLegacy } = require('customize-cra')
//https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
module.exports = override(
    addDecoratorsLegacy(),
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: {
            'primary-color': '#1DA57A',
            'font-size-base': '10px',
            'tabs-card-height': '24px',
            'font-family': "courier",
            //'background-color-base': '#001529',
            //"tree-title-height": "12",
            "tree-child-padding": '0px',
            "padding-sm": "0px",
        },
    }),
);