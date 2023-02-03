import React, { useState, useEffect } from 'react';

const NamiContext = React.createContext(null);

export const NamiProvider = ({ children }) => {
    const [api, setApi] = useState(null)

    useEffect(() => {
        connect(true, true)
    }, [])

    const connect = (requestId, silent) => {
        if (!window.cardano.nami) {
            alert("Nami wallet not found! Please install it")
            return
        }
        window.cardano.nami.enable({ requestIdentification: requestId, onlySilent: silent })
            .then((connectedApi) => {
                setApi(connectedApi)
            })
            .catch((e) => {
                console.log(e)
            })
    }

    const values = { api, connect }

    return <NamiContext.Provider value={values}>{children}</NamiContext.Provider>
}

const useNami = () => {
    const context = React.useContext(NamiContext)

    if (context === undefined) {
        throw new Error("Install Nami")
    }

    return context
}

export default useNami;