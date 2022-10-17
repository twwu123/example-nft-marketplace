import { useState } from "react"
import axios from "axios";
import { Card, Label, TextInput, Button, Spinner } from "flowbite-react"
import { Buffer } from "buffer";
import useWasm from "../../../hooks/useWasm"
import useYoroi from "../../../hooks/useYoroi"
import { useToast } from "../../../hooks/useToast";

const MintFormCard = () => {
	const [tokenName, setTokenName] = useState("")
	const [tokenImageURL, setTokenImageURL] = useState("")
	const [tokenDescription, setTokenDescription] = useState("")
	const [loading, setLoading] = useState(false)

	const { api } = useYoroi()
	const wasm = useWasm()
	const toast = useToast(4000);
	const yoroiBackendUrl = "https://testnet-backend.yoroiwallet.com/api"

	const mintToken = async (event) => {
		event.preventDefault()
		setLoading(true)
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

		// Technically we could use any address controlled by the wallet as the required signer to mint the NFT
		// But we'll just use the first used address here
		const hexUsedAddresses = await api?.getUsedAddresses()
		const wasmFirstUsedAddress = wasm.Address.from_hex(hexUsedAddresses[0])
		const wasmFirstUsedAddresKeyHash = wasm.BaseAddress.from_address(wasmFirstUsedAddress).payment_cred().to_keyhash()

		const tipStatus = await axios.get(`${yoroiBackendUrl}/v2/tipStatus`)
		const currentSlot = tipStatus.data.bestBlock.globalSlot

		// This policy means that this token can only be minted between now and 1000 slots in the future
		// So it is only guaranteed to be an NFT if we mint once, and then wait around 15 minutes or so
		// It also requires the minting transaction to be signed by the first used address

		// Note that Plutus Scripts can also be used as the token's policy script, but is significantly
		// more complicated. I've decided to use a simple Native Script here for the example, but
		// a plutus script would provide a better guarantee that this NFT is unique.
		const policyScript = wasm.NativeScript.from_json(JSON.stringify({
			"ScriptAll": {
				"native_scripts": [
					{
						"TimelockExpiry": {
							"slot": currentSlot + 1000
						}
					},
					{
						"ScriptPubkey": {
							"addr_keyhash": wasmFirstUsedAddresKeyHash.to_hex()
						}
					}
				]
			}
		}))

		const hexChangeAddress = await api?.getChangeAddress()
		const wasmChangeAddress = wasm.Address.from_hex(hexChangeAddress);

		let wasmOutputBuilder = wasm.TransactionOutputBuilder.new();
		wasmOutputBuilder = wasmOutputBuilder.with_address(wasmChangeAddress)
		txBuilder.add_mint_asset_and_output_min_required_coin(
			policyScript,
			wasm.AssetName.new(Buffer.from(tokenName, 'utf8')),
			wasm.Int.new_i32(1),
			wasmOutputBuilder.next()
		)

		const hexInputUtxos = await api?.getUtxos()
		const wasmInputUtxos = wasm.TransactionUnspentOutputs.new()
		for (let i = 0; i < hexInputUtxos.length; i++) {
			wasmInputUtxos.add(wasm.TransactionUnspentOutput.from_hex(hexInputUtxos[i]))
		}
		txBuilder.add_inputs_from(wasmInputUtxos, wasm.CoinSelectionStrategyCIP2.RandomImproveMultiAsset)

		// This is the absolute minimum metadata required to conform to CIP-25
		const metadataObj = {
			[policyScript.hash(0).to_hex()]: {
				[tokenName]: {
					"name": tokenName,
					"image": tokenImageURL,
					"description": tokenDescription
				}
			}
		}

		txBuilder.set_ttl(currentSlot + 1000)
		txBuilder.add_json_metadatum(wasm.BigNum.from_str('721'), JSON.stringify(metadataObj))
		txBuilder.add_required_signer(wasmFirstUsedAddresKeyHash)
		txBuilder.add_change_if_needed(wasmChangeAddress)
		const wasmTransaction = txBuilder.build_tx()

		setLoading(false)
		api?.signTx(wasmTransaction.to_hex())
			.then((hexWitnessSet) => {
				const wasmWitnessSet = wasm.TransactionWitnessSet.from_hex(hexWitnessSet)
				const wasmSignedTransaction = wasm.Transaction.new(wasmTransaction.body(), wasmWitnessSet, wasmTransaction.auxiliary_data())
				api?.submitTx(wasmSignedTransaction.to_hex())
					.then((txId) => {
						toast('success', "Tx successfully submitted")
						console.log("Tx successfully submitted ", txId)
					})
					.catch((e) => {
						toast('error', 'Transaction was rejected');
						console.log(e)
					})
			})
			.catch((e) => {
				toast('error', e.info);
				console.log(e)
			})
	}

	return (
		<>
			<Card>
				<form className="flex flex-col gap-4"
					onSubmit={mintToken}>
					<div>
						<div className="mb-2 block">
							<Label
								htmlFor="tokenName"
								value="Token Name"
							/>
						</div>
						<TextInput
							id="tokenName"
							type="text"
							required={true}
							value={tokenName}
							onChange={(e) => { setTokenName(e.target.value) }}
						/>
					</div>
					<div>
						<div className="mb-2 block">
							<Label
								htmlFor="tokenImage"
								value="Token Image URL"
							/>
						</div>
						<TextInput
							id="tokenImage"
							type="text"
							required={true}
							value={tokenImageURL}
							onChange={(e) => { setTokenImageURL(e.target.value) }}
						/>
					</div>
					<div>
						<div className="mb-2 block">
							<Label
								htmlFor="tokenDescription"
								value="Token Description"
							/>
						</div>
						<TextInput
							id="tokenDescription"
							type="text"
							required={true}
							value={tokenDescription}
							onChange={(e) => { setTokenDescription(e.target.value) }}
						/>
					</div>
					<Button type="submit">
						Submit
					</Button>
				</form>
			</Card>
			{ loading && 
				<div className="float-right pt-5">
					<Spinner />
				</div>
			}
		</>
	)
}

export default MintFormCard