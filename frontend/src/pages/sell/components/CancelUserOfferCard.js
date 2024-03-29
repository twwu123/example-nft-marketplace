import useWasm from "../../../hooks/useWasm"
import useNami from "../../../hooks/useNami"
import { useToast } from "../../../hooks/useToast"
import { Buffer } from "buffer"
import { hexToBytes, mergeSignatures } from "../../../utils/utils"

const UserOfferCard = ({ offer, index }) => {
    const { api } = useNami()
    const wasm = useWasm()
    const toast = useToast(4000)

    const cancelOffer = async () => {
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

        // These fields will be specific to your script, the script hex is the compiled version of your plutus contract
        const plutusScriptHex = "590b7c590b79010000323322323233223233223232323232323232323232323232323232323232323232323232323233223232322323223223232533532323235003223500322533500613302b330374910f73656c6c6572206e6f742070616964003232333553018120013502e502c2350012233355301b1200135031502f2350012233350012330374800000488cc0e00080048cc0dc005200000133012002001335032335503402a335032335503402a00550335033333553012120012233553017120012350012233550380023355301a1200123500122335503b00233350012330384800000488cc0e40080048cc0e000520000013301200200150323500222222222222233355301e1200122350022222350042233500225335333573466e3c0600041381344cd41180180204020802140f80294cd4c0c0d40088888888888880304c0d9262215335001103b221303a4984cc0dd2401166f6e6c792073656c6c6572206d61792063616e63656c0035002222222222222533533355302212001335039225335002210031001504025335333573466e3c0400041181144d410800454104010841184110cccd5cd19b8735573aa0089000119910919800801801191919191919191919191919191999ab9a3370e6aae754031200023333333333332222222222221233333333333300100d00c00b00a00900800700600500400300233502202335742a01866a0440466ae85402ccd4088090d5d0a805199aa8133ae502535742a012666aa04ceb94094d5d0a80419a8110159aba150073335502602c75a6ae854018c8c8c8cccd5cd19b8735573aa00490001199109198008018011919191999ab9a3370e6aae754009200023322123300100300233503675a6ae854008c0dcd5d09aba2500223263203933573807407206e26aae7940044dd50009aba150023232323333573466e1cd55cea8012400046644246600200600466a06ceb4d5d0a801181b9aba135744a004464c6407266ae700e80e40dc4d55cf280089baa001357426ae8940088c98c80d4cd5ce01b01a81989aab9e5001137540026ae854014cd4089d71aba1500433355026028200135742a006666aa04ceb88004d5d0a80118151aba135744a004464c6406266ae700c80c40bc4d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135573ca00226ea8004d5d0a802180d1aba135744a008464c6404666ae7009008c084cccd5cd19b8750054800884880048cccd5cd19b8750064800084880088c98c808ccd5ce0120118108101999ab9a3370e6aae75401d2000232321233001003002375c6ae84d5d128041bad35742a00e464c6404266ae7008808407c40804c98c8080cd5ce24810350543500020135573ca00226ea80044d55ce9baa001135573ca00226ea800488cd54c01c480048d400488cd540a0008ccd40048cd54c02c480048d400488cd540b0008d5403400400488ccd5540200380080048cd54c02c480048d400488cd540b0008d54030004004ccd55400c024008004444888ccd54c01048005408ccd54c01c480048d400488cd540a0008d54024004ccd54c0104800488d4008894cd4ccd54c03048004c8cd409088ccd400c88008008004d40048800448cc004894cd400840c840040bc8d400488cc028008014018400c4cd409c01000d4090004cd54c01c480048d400488c8cd540a400cc004014c8004d540bc894cd40044d5402800c884d4008894cd4cc03000802044888cc0080280104c01800c008c8004d540a088448894cd40044008884cc014008ccd54c01c480040140100044484888c00c0104484888c004010c8004d540948844894cd400454084884cd4088c010008cd54c01848004010004c8004d5409088448894cd40044d400c88004884ccd401488008c010008ccd54c01c4800401401000488ccd5cd19b8f0020010240231232230023758002640026aa046446666aae7c004940788cd4074c010d5d080118019aba2002012232323333573466e1cd55cea8012400046644246600200600460146ae854008c014d5d09aba2500223263201233573802602402026aae7940044dd50009191919191999ab9a3370e6aae75401120002333322221233330010050040030023232323333573466e1cd55cea8012400046644246600200600460266ae854008cd4034048d5d09aba2500223263201733573803002e02a26aae7940044dd50009aba150043335500875ca00e6ae85400cc8c8c8cccd5cd19b875001480108c84888c008010d5d09aab9e500323333573466e1d4009200223212223001004375c6ae84d55cf280211999ab9a3370ea00690001091100191931900c99ab9c01a019017016015135573aa00226ea8004d5d0a80119a804bae357426ae8940088c98c804ccd5ce00a00980889aba25001135744a00226aae7940044dd5000899aa800bae75a224464460046eac004c8004d5408088c8cccd55cf8011280e119a80d99aa80e98031aab9d5002300535573ca00460086ae8800c0404d5d080089119191999ab9a3370ea002900011a80e98029aba135573ca00646666ae68cdc3a801240044a03a464c6402066ae700440400380344d55cea80089baa001232323333573466e1d400520062321222230040053007357426aae79400c8cccd5cd19b875002480108c848888c008014c024d5d09aab9e500423333573466e1d400d20022321222230010053007357426aae7940148cccd5cd19b875004480008c848888c00c014dd71aba135573ca00c464c6402066ae7004404003803403002c4d55cea80089baa001232323333573466e1cd55cea80124000466442466002006004600a6ae854008dd69aba135744a004464c6401866ae700340300284d55cf280089baa0012323333573466e1cd55cea800a400046eb8d5d09aab9e500223263200a33573801601401026ea80048c8c8c8c8c8cccd5cd19b8750014803084888888800c8cccd5cd19b875002480288488888880108cccd5cd19b875003480208cc8848888888cc004024020dd71aba15005375a6ae84d5d1280291999ab9a3370ea00890031199109111111198010048041bae35742a00e6eb8d5d09aba2500723333573466e1d40152004233221222222233006009008300c35742a0126eb8d5d09aba2500923333573466e1d40192002232122222223007008300d357426aae79402c8cccd5cd19b875007480008c848888888c014020c038d5d09aab9e500c23263201333573802802602202001e01c01a01801626aae7540104d55cf280189aab9e5002135573ca00226ea80048c8c8c8c8cccd5cd19b875001480088ccc888488ccc00401401000cdd69aba15004375a6ae85400cdd69aba135744a00646666ae68cdc3a80124000464244600400660106ae84d55cf280311931900619ab9c00d00c00a009135573aa00626ae8940044d55cf280089baa001232323333573466e1d400520022321223001003375c6ae84d55cf280191999ab9a3370ea004900011909118010019bae357426aae7940108c98c8024cd5ce00500480380309aab9d50011375400224464646666ae68cdc3a800a40084244400246666ae68cdc3a8012400446424446006008600c6ae84d55cf280211999ab9a3370ea00690001091100111931900519ab9c00b00a008007006135573aa00226ea80048c8cccd5cd19b87500148008805c8cccd5cd19b87500248000805c8c98c8018cd5ce00380300200189aab9d37540029309000a490350543100488100112330010020102253350021001100f12335002223335003220020020013500122001122123300100300222333573466e2000800403003488cdc0001000990009aa80511299a8008a802110a99aa999a991a80091110011a8011100088061080710807099a80280118020008980200088910010910911980080200188910919800801801090911801001889100091980124917657870656374656420312073637269707420696e707574000032253350011004133573800400624400424400222464600200244660066004004003"
        // This particular redeemer corresponds to the "Cancel" data type in  my script
        const wasmRedeemData = wasm.encode_json_str_to_plutus_datum(JSON.stringify({
            "fields": [],
            "constructor": 1
        }), wasm.PlutusDatumSchema.DetailedSchema)

        const wasmRedeemer = wasm.Redeemer.new(
            wasm.RedeemerTag.new_spend(),
            wasm.BigNum.from_str("0"),
            wasmRedeemData,
            wasm.ExUnits.new(
                wasm.BigNum.from_str("2180128"),
                wasm.BigNum.from_str("632475719")
            )
        )

        // Next build the Tx Input and Value
        const wasmTxInputsBuilder = wasm.TxInputsBuilder.new()
        const wasmOfferTxInput = wasm.TransactionInput.new(wasm.TransactionHash.from_hex(offer.transactionId), offer.outputId)

        // The datum is inlined, so we can build a DatumSource and point it to the offer UTXO
        const plutusScriptWitness = wasm.PlutusWitness.new_with_ref(
            wasm.PlutusScriptSource.new(wasm.PlutusScript.from_hex_with_version(plutusScriptHex, wasm.Language.new_plutus_v2())),
            wasm.DatumSource.new_ref_input(wasmOfferTxInput),
            wasmRedeemer
        )

        // Should grab the value of the input from backend
        const wasmValue = wasm.Value.new(wasm.BigNum.from_str("2000000"))
        const wasmMultiasset = wasm.MultiAsset.new()
        const wasmAssets = wasm.Assets.new()
        wasmAssets.insert(wasm.AssetName.new(Buffer.from(offer.name, "utf8")), wasm.BigNum.from_str("1"))
        wasmMultiasset.insert(wasm.ScriptHash.from_hex(offer.policyId), wasmAssets)
        wasmValue.set_multiasset(wasmMultiasset)

        // Finally we add the plutus script input to the inputs builder
        wasmTxInputsBuilder.add_plutus_script_input(plutusScriptWitness, wasmOfferTxInput, wasmValue)
        // Maybe add some more value to pay fees
        const hexInputUtxos = await window.cardano.getUtxos()
        for (let i = 0; i < hexInputUtxos.length; i++) {
            const wasmUtxo = wasm.TransactionUnspentOutput.from_hex(hexInputUtxos[i])
            wasmTxInputsBuilder.add_input(wasmUtxo.output().address(), wasmUtxo.input(), wasmUtxo.output().amount())
        }
        // Then we can set the tx inputs to the tx inputs builder
        txBuilder.set_inputs(wasmTxInputsBuilder)

        // For plutus transactions, we need some collateral also
        const hexCollateralUtxos = await window.cardano.getCollateral(3000000)
        const collateralTxInputsBuilder = wasm.TxInputsBuilder.new()
        for (let i = 0; i < hexCollateralUtxos.length; i++) {
            const wasmUtxo = wasm.TransactionUnspentOutput.from_hex(hexCollateralUtxos[i])
            collateralTxInputsBuilder.add_input(wasmUtxo.output().address(), wasmUtxo.input(), wasmUtxo.output().amount())
        }
        txBuilder.set_collateral(collateralTxInputsBuilder)

        // We need to handle hashing of plutus witness. Because the datum is actually included inline within the script UTXO
        // therefore, we need to intentionally leave out the datum in the witness set for the hash.
        const wasmRedeemers = wasm.Redeemers.new()
        wasmRedeemers.add(txBuilder.get_plutus_input_scripts().get(0).redeemer())
        // The cost models of v2 scripts must be manually built currently
        const costModel = wasm.TxBuilderConstants.plutus_vasil_cost_models().get(wasm.Language.new_plutus_v2());
        const costmdls = wasm.Costmdls.new()
        costmdls.insert(wasm.Language.new_plutus_v2(), costModel)
        // I intentionally put an undefined where the datum should go to make it clearer, but the argument can simply be left empty
        const plutusWitnessHash = wasm.hash_script_data(wasmRedeemers, costmdls, undefined)
        txBuilder.set_script_data_hash(plutusWitnessHash)

        // We need to add the required signer of our first used address, since the script
        // requires the seller's signature for a cancel operation
        txBuilder.add_required_signer(wasm.BaseAddress.from_address(wasm.Address.from_bech32(offer.seller)).payment_cred().to_keyhash())

        // Handle change (this should include the NFT in the offer)
        const hexChangeAddress = await api?.getChangeAddress()
        const wasmChangeAddress = wasm.Address.from_hex(hexChangeAddress)
        txBuilder.add_change_if_needed(wasmChangeAddress)

        const unsignedTransaction = txBuilder.build_tx()
        const deserializedTx = wasm.Transaction.from_bytes(unsignedTransaction.to_bytes())
        const txWitnessSet = deserializedTx.witness_set();
        api?.signTx(unsignedTransaction.to_hex())
            .then((newWitnessSet) => {
                const newSignatures = wasm.TransactionWitnessSet.from_bytes(hexToBytes(newWitnessSet)).vkeys() ?? wasm.Vkeywitnesses.new();

                const txSignatures = mergeSignatures(wasm, txWitnessSet, newSignatures)
                txWitnessSet.set_vkeys(txSignatures);

                const signedTx = Buffer.from(wasm.Transaction.new(
                    deserializedTx.body(),
                    txWitnessSet,
                    deserializedTx.auxiliary_data()
                ).to_bytes()).toString('hex');

                api.submitTx(signedTx)
                    .then(txId => {
                        const strOffers = localStorage.getItem("offers")
                        const offers = JSON.parse(strOffers)
                        offers.splice(index, 1)
                        localStorage.setItem("offers", JSON.stringify(offers))

                        toast('success', `Transaction successfully submitted`)
                        console.log(`Transaction successfully submitted: ${txId}`)
                    })
                    .catch(err => {
                        toast('error', err.info)
                        console.log(err.info)
                    })
            }).catch(err => {
                toast('error', err.info)
                console.log(err.info)
            })
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
                        <button href="#" className="inline-flex items-center my-2 py-2 px-3 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                            onClick={cancelOffer}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserOfferCard