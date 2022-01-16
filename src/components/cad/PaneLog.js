import React from 'react'
import { sharedProp } from '../../helpers/decorator'

@sharedProp('paneLogItems')
class PaneLog extends React.Component {

    render = () => {
        return (
            <div className="PaneLog">
                {[...this.props.paneLogItems].reverse().map((log, i) => <div key={i}>{log}</div>)}
            </div>
        )
    }

}

export default PaneLog
