import React from "react";
import { Upload, Button } from "antd";


const ImportButton = ({ title = "", icon, accept, onImport, multiple, classN = "" }) => {
    const dummyRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok")
        }, 0)
    }

    return (
        <Upload
            showUploadList={false}
            className={classN}
            directory={accept === "directory" ? true : false}
            accept={accept === "directory" ? "" : accept}
            customRequest={dummyRequest}
            multiple={multiple}
            beforeUpload={onImport}>
            <Button
                type="primary"
                icon={icon ? icon : ""}
                size='small'  >{title}
            </Button>
        </Upload>
    )
}

export default ImportButton
