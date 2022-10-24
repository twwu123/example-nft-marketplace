import { Spinner } from "flowbite-react"
import useWasm from "../../../hooks/useWasm"
import useYoroi from "../../../hooks/useYoroi"
import axios from "axios";
import { useState, useEffect } from "react";
import NFTCard from "./SellNFTCard";

const NFTList = () => {
    const { api } = useYoroi()
    const wasm = useWasm()
    const yoroiBackendUrl = "https://testnet-backend.yoroiwallet.com/api"

    const [NFTList, setNFTList] = useState([])
    const [metadatum, setMetadatum] = useState(null)

    useEffect(() => {
        if (!wasm || !api) return
        const getNFTList = async () => {
            const hexBalance = await api.getBalance()
            const wasmBalance = wasm.Value.from_hex(hexBalance)
            const balanceJSON = wasmBalance.to_json()
            const balanceObject = JSON.parse(balanceJSON)
            if (!balanceObject["multiasset"]) {
                setNFTList([])
                setMetadatum([])
                return
            }
            const currentNFTList = []
            const policyIds = Object.keys(balanceObject["multiasset"])
            for (let i = 0; i < policyIds.length; i++) {
                const NFTNames = Object.keys(balanceObject["multiasset"][policyIds[i]])
                for (let j = 0; j < NFTNames.length; j++) {
                    currentNFTList.push(
                        {
                            nameHex: NFTNames[j],
                            policy: policyIds[i]
                        }
                    )
                }
            }
            setNFTList(currentNFTList)
        }
        getNFTList()
    }, [wasm, api])

    useEffect(() => {
        if (NFTList.length === 0) return
        console.log(NFTList)
        const getMetadatum = async () => {
            const metadatumResponse = await axios.post(
                `${yoroiBackendUrl}/multiAsset/metadata`,
                {
                    assets: NFTList
                }
            )
            console.log(metadatumResponse)
            const tokens = Object.keys(metadatumResponse.data)
            let metadataList = []
            for (let i = 0; i < tokens.length; i++) {
                const tokenListInfo = metadatumResponse.data[tokens[i]]
                for (let j = 0; j < tokenListInfo.length; j++) {
                    const tokenInfo = tokenListInfo[j]
                    if (tokenInfo.key === "721") {
                        metadataList.push(tokenInfo.metadata)
                    }
                }
            }
            setMetadatum(metadataList)
        }
        getMetadatum()
    }, [NFTList])



    return (
        <div>
            <div>
                <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white pb-5">NFTs available</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                {metadatum ?
                    metadatum.length !== 0 ?
                        metadatum.map((val, idx) => {
                            return (
                                <NFTCard metadata={val} key={idx} />
                            )
                        })
                        :
                        <div>
                            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white pb-10">No NFTs found</p>
                        </div>
                    :
                    <div>
                        <Spinner />
                        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white pb-10">Loading your NFTs</p>
                    </div>
                }
            </div>
        </div>
    )
}


export default NFTList