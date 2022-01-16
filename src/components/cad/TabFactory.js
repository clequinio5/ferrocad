import React from "react"
//import DrawAreaRecoilWrapper from './DrawAreaRecoilWrapper'
import DrawArea from './DrawArea'
import { generateId, deepMergeObj } from '../../helpers/utils'

import da_parameters_ref from '../../data/da-parameters/da-parameters-ref.json'

const TabFactory = (tabTitle, daParameters = da_parameters_ref, projectKey = "") => {
    const nParameters = deepMergeObj(da_parameters_ref, daParameters)
    const nTab = {
        tabKey: generateId('tb'),
        projectKey: projectKey,
        ref: React.createRef(),
        title: tabTitle,
        //content: <DrawAreaRecoilWrapper params={nParameters} />
        content: <DrawArea params={nParameters} />
    }
    return nTab
}

export default TabFactory
