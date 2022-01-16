import React from 'react';
import ImportButton from "../common/ImportButton";
import { Button } from 'antd';

const MenuCAD = (props) => {
    return (
        <>
            <ImportButton
                title="Import"
                icon="download"
                multiple={true}
                onImport={props.onImportClick}
                accept=".ferrocad"
                classN="MenuButton"
            />
            <Button
                type="primary"
                icon="upload"
                size='small'
                className="MenuButton"
                onClick={props.onExportClick} >Export</Button>
            <ImportButton
                title="Import DXF"
                icon="branches"
                onImport={props.onImportDXFClick}
                accept=".dxf"
                classN="MenuButton"
            />
        </>
    )
}

export default MenuCAD
