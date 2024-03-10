import { abi, contractAddress } from "../constants/index";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ConnectButton } from "@web3uikit/web3";
import { useEffect, useState } from "react";
import { useNotification } from "@web3uikit/core";
import { CHAIN, CHAINID } from "../config";

const useContractFunction = (votingAddress, functionName) => {
  return useWeb3Contract({
    abi: abi,
    contractAddress: votingAddress,
    functionName: functionName,
    params: {},
  }).runContractFunction;
};
export default function Admin() {
  const [errors, setErrors] = useState("");
  const [owner, setOwner] = useState("");
  const { chainId: chainID } = useMoralis();
  const { account } = useMoralis();
  const chainId = parseInt(chainID);
  const dispatch = useNotification();
  console.log(CHAINID === chainId);
  const votingAddress =
    chainId in contractAddress ? contractAddress[chainId] : null;

  const registrationStart = useContractFunction(votingAddress, "registrationStart");
  const votingStart = useContractFunction(votingAddress, "votingStart");
  const declareResult = useContractFunction(votingAddress, "declareResult");
  const getNumberOfCandidates = useContractFunction(votingAddress, "getNumberOfCandidates");
  const getVotingStatus = useContractFunction(votingAddress, "getVotingStatus");
  const getTotalVotes = useContractFunction(votingAddress, "getTotalVotes");
  const getOwner = useContractFunction(votingAddress, "getOwner");
  const startNewElection = useContractFunction(votingAddress, "startNewElection");


  const updateErrors = async (error) => {
    let message;
    try {
      if (error.message.includes("Missing web3 instance")) {
        message = "Connect your account";
      }

      const candSize = await getNumberOfCandidates();
      const votingStatus = await getVotingStatus();
      const totalVotes = await getTotalVotes();
      console.log(votingStatus === 1);
      console.log(error.message);
      if (votingStatus === 0) {
        message = "Cannot Start Registration In Voting Period";
      } else if (candSize < 2) {
        message = "Not Enough Candidates Have Registered";
      } else if (totalVotes < 1) {
        message = "Not Enough Votes To Declare Result";
      } else {
        message = "Error!";
      }
      setErrors(message);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleSuccessNotification(tx);
  };

  const handleError = async (error) => {
    await updateErrors(error);
    handleErrorNotification();
  };

  const handleSuccessNotification = (tx) => {
    dispatch({
      type: "success",
      message: "Transaction Complete",
      title: "Tx Notification",
      position: "topR",
    });
  };
  const handleErrorNotification = (tx) => {
    dispatch({
      type: "error",
      message: `${errors}`,
      title: "ERROR",
      position: "topR",
    });
  };

  useEffect(() => {
    async function update() {
      try {
        const tempOwner = await getOwner();
        setOwner(tempOwner);
      } catch (error) {
        console.log(error);
      }
    }

    update();
  }, [account]);
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
                    <ConnectButton
                      onClick={(e) => e.preventDefault()}
                      moralisAuth={false}
                    />
                  </div>
                </form>
                {chainId.toString() !== CHAINID && <div className="text-danger h4 p-2">Please Connect to {CHAIN}</div>}
                <div className="row">
                  <div className="col-6">
                    <button
                      className="btn btn-primary"
                      disabled={(account && owner && account.toLowerCase() !== owner.toLowerCase()) || chainId.toString() !== CHAINID}
                      onClick={() => {
                        try {
                          registrationStart({
                            onError: (error) => {
                              handleError(error);
                              console.log(error);
                            },
                            onSuccess: (tx) => {
                              handleSuccess(tx);
                            },
                          });
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                    >
                      Start Registration Phase
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      className="btn btn-primary"
                      disabled={(account && owner && account.toLowerCase() !== owner.toLowerCase()) || chainId.toString() !== CHAINID}
                      onClick={() => {
                        try {
                          votingStart({
                            onError: (error) => {
                              handleError(error);
                            },
                            onSuccess: (tx) => {
                              handleSuccess(tx);
                            },
                          });
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                    >
                      Start Voting Phase
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      className="btn btn-primary"
                      disabled={(account && owner && account.toLowerCase() !== owner.toLowerCase()) || chainId.toString() !== CHAINID}
                      onClick={async () => {
                        try {
                          declareResult({
                            onError: (error) => {
                              handleError(error);
                            },
                            onSuccess: (tx) => {
                              handleSuccess(tx);
                            },
                          });
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                    >
                      Declare Results
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      className="btn btn-primary"
                      disabled={(account && owner && account.toLowerCase() !== owner.toLowerCase()) || chainId.toString() !== CHAINID}
                      onClick={async () => {
                        try {
                          startNewElection({
                            onError: (error) => {
                              handleError(error);
                            },
                            onSuccess: (tx) => {
                              handleSuccess(tx);
                            },
                          });
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                    >
                      Start a new election
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
