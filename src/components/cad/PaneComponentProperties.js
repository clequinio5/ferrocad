import React from 'react';
import { sharedProp } from '../../helpers/decorator.js';

@sharedProp('selectedComponentProperties')
class PaneComponentProperties extends React.Component {

    render = () => {
        return (
            <>
                <div className='PaneBoxHeader'>
                    PROPERTIES
                </div>
                <div className="PaneBoxContent">
                    <table>
                        <tbody>
                            {Object.keys(this.props.selectedComponentProperties)
                                .sort()
                                .map(p => {
                                    return (
                                        <tr key={p}>
                                            <td style={{ width: 80 }}>{p}</td>
                                            <td>{this.props.selectedComponentProperties[p]}</td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </table>
                </div>
            </>
        )
    }

}


export default PaneComponentProperties
