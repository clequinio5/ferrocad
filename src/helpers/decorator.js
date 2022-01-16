import React from 'react'
import { useRecoilState } from 'recoil';

const firstLetterUpperCase = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

const sharedProp = (statePropName) => (WrappedComponent) => {
    const atomName = statePropName + "Atom"
    const atom = require('../recoil/atoms.js')[atomName]
    return React.forwardRef((props, ref) => {
        const [prop, propSetter] = useRecoilState(atom);
        let stateProps = { [statePropName]: prop, ['set' + firstLetterUpperCase(statePropName)]: propSetter }
        if (statePropName === "paneLogItems") {
            const log = (log) => propSetter([...prop, log])
            stateProps = { ...stateProps, log }
        }
        return <WrappedComponent {...stateProps} {...props} ref={ref} />
    })
}

export { sharedProp }