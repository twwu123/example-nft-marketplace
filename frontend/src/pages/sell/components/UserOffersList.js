import useWasm from "../../../hooks/useWasm"
import useYoroi from "../../../hooks/useYoroi"
import { useEffect, useState } from "react"
import UserOfferCard from "./CancelUserOfferCard"

const UserOffersList = () => {
    const { api } = useYoroi()
    const wasm = useWasm()

    const [userOffers, setUserOffers] = useState([])

    useEffect(() => {
        const getUserOffers = async () => {
            const strOffers = localStorage.getItem("offers")
            if (!strOffers || !api || !wasm) return
            const hexUserAddress = await api?.getUsedAddresses({ page: 0, limit: 1 })
            const offers = JSON.parse(strOffers)
            const currentUserOffers = []
            for (let i = 0; i < offers.length; i++) {
                const wasmUserAddress = wasm.Address.from_hex(hexUserAddress[0])
                if (offers[i]["seller"] === wasmUserAddress.to_bech32()) {
                    offers[i]["index"] = i
                    currentUserOffers.push(offers[i])
                }
            }
            setUserOffers(currentUserOffers)
        }
        getUserOffers()
    }, [api, wasm])

    return (
        <div>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white pb-5">Your offers</p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                {
                    userOffers.map((val, idx) => {
                        return (
                            <UserOfferCard offer={val} index={val["index"]} key={idx} />
                        )
                    })
                }
            </div>
        </div>
    )
}

export default UserOffersList