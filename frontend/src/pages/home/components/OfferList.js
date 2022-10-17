import useWasm from "../../../hooks/useWasm"
import useYoroi from "../../../hooks/useYoroi"
import { useToast } from "../../../hooks/useToast"
import { useEffect, useState } from "react"
import { Buffer } from "buffer"

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

const PublicOfferCard = ({ offer, index }) => {
    const { api } = useYoroi()
    const wasm = useWasm()
    const toast = useToast(4000)

    const buyOffer = () => {
        
    }

    return (
        <div className="pr-5">
            <div className="flex flex-col justify-between h-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <a href={offer.image} target="blank">
                    <img className="rounded-t-lg max-h-[50vh]" src={offer.image} alt="" />
                </a>
                <div className="p-5">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{offer.name}</h5>
                    <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{offer.price / 1000000} ADA</h5>
                    <div className="grid">
                        <button href="#" className="inline-flex items-center my-2 py-2 px-3 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                            onClick={buyOffer}>
                            Buy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OfferList