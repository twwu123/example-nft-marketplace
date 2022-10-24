import useWasm from "../../../hooks/useWasm"
import useYoroi from "../../../hooks/useYoroi"
import { useEffect, useState } from "react"
import PublicOfferCard from "./BuyPublicOfferCard"

const OfferList = () => {
    const { api } = useYoroi()
    const wasm = useWasm()

    const [publicOffers, setPublicOffers] = useState([])

    useEffect(() => {
        const getPublicOffers = async () => {
            const strOffers = localStorage.getItem("offers")
            if (!strOffers || !api || !wasm) return
            const offers = JSON.parse(strOffers)
            const currentPublicOffers = []
            for (let i = 0; i < offers.length; i++) {
                offers[i]["index"] = i
                currentPublicOffers.push(offers[i])
            }
            setPublicOffers(currentPublicOffers)
        }
        getPublicOffers()
    }, [api, wasm])

    useEffect(() => {
        console.log(publicOffers)
    }, [publicOffers])

    return (
        <div>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white py-5">Available offers</p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                {
                    publicOffers.map((val, idx) => {
                        return (
                            <PublicOfferCard offer={val} index={val["index"]} key={idx} />
                        )
                    })
                }
            </div>
        </div>
    )
}

export default OfferList