import { Spinner, TextInput } from "flowbite-react"
import useWasm from "../../../hooks/useWasm"
import useYoroi from "../../../hooks/useYoroi"
import axios from "axios";
import { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { useToast } from "../../../hooks/useToast";

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
                            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">No NFTs found</p>
                        </div>
                    :
                    <div>
                        <Spinner />
                        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Loading your NFTs</p>
                    </div>
                }
            </div>
        </div>
    )
}

const NFTCard = ({ metadata }) => {
    const [tokenPrice, setTokenPrice] = useState("")
    const [tokenPolicyId, setTokenPolicyId] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [imageURL, setImageURL] = useState("")
    const toast = useToast(4000);

    useEffect(() => {
        if (!metadata) return
        const policyId = Object.keys(metadata)[0]
        const currentTokenName = Object.keys(metadata[policyId])[0]
        let currentURL = metadata[policyId][currentTokenName].image
        if (currentURL.startsWith("ipfs://")) {
            currentURL = "https://ipfs.io/ipfs/" + currentURL.slice(7)
        }
        setTokenPolicyId(policyId)
        setTokenName(currentTokenName)
        setTokenDescription(metadata[policyId][currentTokenName].description)
        setImageURL(currentURL)
    }, [metadata])

    const { api } = useYoroi()
    const wasm = useWasm()

    const sellToken = async () => {
        const txBuilder = wasm?.TransactionBuilder.new(
            wasm.TransactionBuilderConfigBuilder.new()
                .fee_algo(
                    wasm.LinearFee.new(
                        wasm.BigNum.from_str("44"),
                        wasm.BigNum.from_str("155381")
                    )
                )
                .coins_per_utxo_word(wasm.BigNum.from_str('34482'))
                .pool_deposit(wasm.BigNum.from_str('500000000'))
                .key_deposit(wasm.BigNum.from_str('2000000'))
                .ex_unit_prices(wasm.ExUnitPrices.new(
                    wasm.UnitInterval.new(wasm.BigNum.from_str("577"), wasm.BigNum.from_str("10000")),
                    wasm.UnitInterval.new(wasm.BigNum.from_str("721"), wasm.BigNum.from_str("10000000"))
                ))
                .max_value_size(5000)
                .max_tx_size(16384)
                .build()
        )

        // build output value, so we can do utxo selection for it. We will use 2 ADA and token
        const wasmValue = wasm.Value.new(wasm.BigNum.from_str("2000000"))
        const wasmMultiasset = wasm.MultiAsset.new()
        const wasmAssets = wasm.Assets.new()
        wasmAssets.insert(wasm.AssetName.new(Buffer.from(tokenName, "utf8")), wasm.BigNum.from_str("1"))
        wasmMultiasset.insert(wasm.ScriptHash.from_hex(tokenPolicyId), wasmAssets)
        wasmValue.set_multiasset(wasmMultiasset)

        const contractAddress = "addr_test1wq0acvhyvhxgcq7kp6gpcv6m44v7cvrp4uyv8lw9ttju35gqk8egf"
        const wasmContractAddress = wasm.Address.from_bech32(contractAddress)
        const wasmOutput = wasm.TransactionOutput.new(
            wasmContractAddress,
            wasmValue
        )

        // we first build the datum so we can inline it in the output
        // note that we're using the first used address of a wallet as the seller's address
        const usedAddresses = await api?.getUsedAddresses({ page: 0, limit: 1 })
        const wasmSellerAddress = wasm.Address.from_hex(usedAddresses[0])
        const wasmDatum = wasm.encode_json_str_to_plutus_datum(JSON.stringify({
            "constructor": 0,
            "fields": [
                {
                    "int": Math.trunc(Number(tokenPrice) * 1000000)
                },
                {
                    "bytes": wasm.BaseAddress.from_address(wasmSellerAddress).payment_cred().to_keyhash().to_hex()
                }
            ]
        }), wasm.PlutusDatumSchema.DetailedSchema)
        wasmOutput.set_plutus_data(wasmDatum)

        // finally we can add the output to our txBuilder
        txBuilder.add_output(wasmOutput)

        // the next step is to get our utxos from the wallet API, so we can perform UTXO selection on it
        const hexBalanceUtxos = await api?.getUtxos()
        const wasmUtxos = wasm.TransactionUnspentOutputs.new()
        for (let i = 0; i < hexBalanceUtxos.length; i++) {
            const wasmUtxo = wasm.TransactionUnspentOutput.from_hex(hexBalanceUtxos[i])
            wasmUtxos.add(wasmUtxo)
        }

        // this performs utxo selection from all the utxos we got from our wallet PAI
        txBuilder.add_inputs_from(wasmUtxos, wasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset)

        // now that we have all inputs and outputs handled, we can finally handle change and fees
        const hexChangeAddress = await api.getChangeAddress()
        const wasmChangeAddress = wasm.Address.from_hex(hexChangeAddress)
        txBuilder.add_change_if_needed(wasmChangeAddress)

        // then build the transaction so we can sign it with out wallet
        const unsignedTransactionHex = txBuilder.build_tx().to_hex()
        api?.signTx(unsignedTransactionHex)
            .then((witnessSetHex) => {
                // the wallet api returns the witness set required
                const wasmWitnessSet = wasm.TransactionWitnessSet.from_hex(witnessSetHex)
                const wasmTx = wasm.Transaction.from_hex(unsignedTransactionHex)
                const wasmSignedTransaction = wasm.Transaction.new(
                    wasmTx.body(),
                    wasmWitnessSet,
                    wasmTx.auxiliary_data()
                )
                const transactionHex = wasmSignedTransaction.to_hex()

                api.submitTx(transactionHex)
                    .then(txId => {
                        toast('success', `Transaction successfully submitted`)
                        console.log(`Transaction successfully submitted: ${txId}`)

                        // I'm using local storage here as our database, since it's just an example
                        // but there should be a dedicated database for your app
                        const wasmTxBody = wasmTx.body()
                        const wasmTxOutputs = wasmTxBody.outputs()
                        const jsonOutputs = JSON.parse(wasmTxOutputs.to_json())
                        let scriptOutputId = 0
                        for (let i = 0; i < jsonOutputs.length; i++) {
                            if (jsonOutputs[i]["address"] === contractAddress) {
                                scriptOutputId = i;
                            }
                        }

                        const strOffers = localStorage.getItem("offers")
                        const offerJSON = {
                            seller: wasmSellerAddress.to_bech32(),
                            policyId: tokenPolicyId,
                            name: tokenName,
                            description: tokenDescription,
                            image: imageURL,
                            price: Math.trunc(Number(tokenPrice) * 1000000),
                            transactionId: txId,
                            outputId: scriptOutputId
                        }
                        if (strOffers) {
                            const offers = JSON.parse(strOffers)
                            localStorage.setItem("offers", JSON.stringify([...offers, offerJSON]))
                        } else {
                            localStorage.setItem("offers", JSON.stringify([offerJSON]))
                        }
                    })
                    .catch(err => {
                        toast('error', err.info)
                        console.log(err)
                    })
            })
            .catch(err => {
                toast('error', err.info)
                console.log(err)
            })
    }

    return (
        <div className="pb-5 pr-5">
            <div className="flex flex-col justify-between h-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <a href={imageURL} target="blank">
                    <img className="rounded-t-lg max-h-[50vh]" src={imageURL} alt="" />
                </a>
                <div className="p-5">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{tokenName}</h5>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{tokenDescription}</p>
                    <div className="grid">
                        <TextInput
                            id="tokenPrice"
                            type="number"
                            placeholder="price (ADA)"
                            value={tokenPrice}
                            onChange={(e) => { setTokenPrice(e.target.value) }}
                        />
                        <button href="#" className="inline-flex items-center my-2 py-2 px-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={sellToken}>
                            Sell
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NFTList