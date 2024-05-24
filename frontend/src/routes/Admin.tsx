
import { ConnectWallet, useChainId, useContract, useContractRead, useAddress, Web3Button } from "@thirdweb-dev/react";
import { CHAIN, CHAINID, CONTRACT_ADDRESS } from "../constants";
export default function Admin() {
    const chainId = useChainId();
    const { contract } = useContract(CONTRACT_ADDRESS);
    const account = useAddress();
    const { data: owner } = useContractRead(contract, "getOwner");
    return (
        <div className="vh-100 mt-5">
            <div className="container w-75">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header card-header-info">
                                <h4 className="text-center h3 card-title">Admin panel</h4>
                            </div>
                            <div className="card-body h-100">
                                <form>
                                    <div className="form-group d-flex flex-direction-col">
                                        <ConnectWallet />
                                    </div>
                                </form>
                                {chainId?.toString() !== CHAINID && <div className="text-danger h4 p-2">Please Connect to {CHAIN}</div>}
                                <div className="row">
                                    <div className="col-6">
                                        <Web3Button
                                            className="btn btn-primary"
                                            isDisabled={(account && owner && account !== owner) || chainId?.toString() !== CHAINID}
                                            contractAddress={CONTRACT_ADDRESS as string}
                                            action={async (contract) => {
                                                try {
                                                    await contract?.call("registrationStart");
                                                } catch (error) {
                                                    console.log("Error Starting Registration Phase: ", error);
                                                }
                                            }}
                                        >
                                            Start Registration Phase
                                        </Web3Button>
                                    </div>
                                    <div className="col-6">
                                        <Web3Button
                                            className="btn btn-primary"
                                            isDisabled={(account && owner && account !== owner) || chainId?.toString() !== CHAINID}
                                            contractAddress={CONTRACT_ADDRESS as string}
                                            action={async (contract) => {
                                                try {
                                                    await contract?.call("votingStart");
                                                } catch (error) {
                                                    console.log("Error Starting Voting Phase: ", error);
                                                }
                                            }}
                                        >
                                            Start Voting Phase
                                        </Web3Button>
                                    </div>
                                    <div className="col-6">
                                        <Web3Button
                                            className="btn btn-primary"
                                            isDisabled={(account && owner && account !== owner) || chainId?.toString() !== CHAINID}
                                            contractAddress={CONTRACT_ADDRESS as string}
                                            action={async (contract) => {
                                                try {
                                                    await contract?.call("declareResult");
                                                } catch (error) {
                                                    console.log("Error Declaring Result: ", error);
                                                }
                                            }}
                                        >
                                            Declare Results
                                        </Web3Button>
                                    </div>
                                    <div className="col-6">
                                        <Web3Button
                                            className="btn btn-primary"
                                            isDisabled={(account && owner && account !== owner) || chainId?.toString() !== CHAINID}
                                            contractAddress={CONTRACT_ADDRESS as string}
                                            action={async (contract) => {
                                                try {
                                                    await contract?.call("startNewElection");
                                                } catch (error) {
                                                    console.log("Error Starting new Election: ", error);
                                                }
                                            }}
                                        >
                                            Start a new election
                                        </Web3Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}