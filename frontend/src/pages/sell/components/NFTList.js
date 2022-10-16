import { Spinner, TextInput, Toast } from "flowbite-react"
import useWasm from "../../../hooks/useWasm"
import useYoroi from "../../../hooks/useYoroi"
import axios from "axios";
import { useState, useEffect } from "react";

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
        const getMetadatum = async () => {
            const metadatumResponse = await axios.post(
                `${yoroiBackendUrl}/multiAsset/metadata`,
                {
                    assets: NFTList
                }
            )
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
                        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">No NFTs found</p>
                    </div>
                :
                <div>
                    <Spinner />
                    <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Loading your NFTs</p>
                </div>
            }
        </div>
    )
}

const NFTCard = ({ metadata }) => {
    const [tokenPrice, setTokenPrice] = useState(null)
    const [tokenPolicyId, setTokenPolicyId] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [imageURL, setImageURL] = useState("")

    useEffect(() => {
        if (!metadata) return
        const policyId = Object.keys(metadata)
        const currentTokenName = Object.keys(metadata[policyId])
        let currentURL = metadata[policyId][currentTokenName].image
        if (currentURL.startsWith("ipfs://")) {
            currentURL = "https://ipfs.io/ipfs/" + currentURL.slice(7)
        }
        setTokenPolicyId(policyId)
        setTokenName(currentTokenName)
        setTokenDescription(metadata[policyId][currentTokenName].description)
        setImageURL(currentURL)
    }, [metadata])

    const sellToken = () => {

    }

    return (
        <div className="px-5 pb-5">
            <div class="flex flex-col justify-between h-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <a href={imageURL} target="blank">
                    <img class="rounded-t-lg max-h-[50vh]" src={imageURL} alt="" />
                </a>
                <div class="p-5">
                    <a href="#">
                        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{tokenName}</h5>
                    </a>
                    <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">{tokenDescription}</p>
                    <div className="grid">
                        <TextInput
                            id="tokenPrice"
                            type="number"
                            placeholder="price (ADA)"
                            value={tokenPrice}
                            onChange={(e) => { setTokenPrice(e.target.value) }}
                        />
                        <button href="#" class="inline-flex items-center my-2 py-2 px-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Sell
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NFTList