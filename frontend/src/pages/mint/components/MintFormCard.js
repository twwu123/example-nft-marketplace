import { Card, Label, TextInput, Button } from "flowbite-react"
import useWasm from "../../../hooks/useWasm"
import useYoroi from "../../../hooks/useYoroi"

const MintFormCard = () => {
    const { api } = useYoroi()
    const wasm = useWasm()

    return (
        <Card>
            <form className="flex flex-col gap-4">
                <div>
                    <div className="mb-2 block">
                        <Label
                            htmlFor="NFTName"
                            value="Token Name"
                        />
                    </div>
                    <TextInput
                        id="NFTName"
                        type="text"
                        required={true}
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
                    />
                </div>
                <Button type="submit">
                    Submit
                </Button>
            </form>
        </Card>
    )
}

export default MintFormCard