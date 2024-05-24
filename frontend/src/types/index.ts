import { ethers } from "ethers";

export type WalletType = {
    account: ethers.providers.JsonRpcSigner | null,
    votingContract: ethers.Contract | null,
    chainId: number | null
};

export type Candidate = {
    id: string,
    name: string,
    voteCount: string
}