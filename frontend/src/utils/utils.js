import { Buffer } from "buffer";

export function bytesToHex(bytes) {
    return Buffer.from(bytes).toString('hex');
}

export function hexToBytes(hex) {
    return Buffer.from(hex, 'hex');
}

export const mergeSignatures = (
    wasm, txWitnessSet, newSignatures,
) => {
    const txSignatures = txWitnessSet.vkeys();

    if (txSignatures !== undefined) {
        const signatures = new Set();

        for (let index = 0; index < txSignatures.len(); index += 1) {
            signatures.add(txSignatures.get(index).to_hex());
        }

        for (let index = 0; index < newSignatures.len(); index += 1) {
            signatures.add(newSignatures.get(index).to_hex());
        }

        const allSignatures = wasm.Vkeywitnesses.new();
        signatures.forEach((witness) => {
            allSignatures.add(wasm.Vkeywitness.from_hex(witness));
        });

        return allSignatures;
    }

    return newSignatures;
};