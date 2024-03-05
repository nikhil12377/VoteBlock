import styles from "../styles/voting.module.css";

import { ConnectButton } from "@web3uikit/web3";
import { abi, contractAddress } from "../constants/index";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useState, useEffect } from "react";
import { useNotification } from "@web3uikit/core";

const useContractFunction = (votingAddress, functionName, params) => {
  return useWeb3Contract({
    abi: abi,
    contractAddress: votingAddress,
    functionName: functionName,
    params: params,
  }).runContractFunction;
};

export default function Candidate() {
  const [regStatus, setRegStatus] = useState("1");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const { chainId: chainID } = useMoralis();
  const [name, setName] = useState("");
  const [ID, setID] = useState("");
  const chainId = parseInt(chainID);
  const dispatch = useNotification();
  const userAddress = useMoralis().account;

  const votingAddress =
    chainId in contractAddress ? contractAddress[chainId] : null;

  const getRegistrationStatus = useContractFunction(votingAddress, "getRegistrationStatus", {})
  const registerCandidate = useContractFunction(votingAddress, "registerCandidate", { _id: ID, _name: name })
  const checkCandidateAlreadyRegisteredOrNot = useContractFunction(votingAddress, "checkCandidateAlreadyRegisteredOrNot", { _id: ID, _name: name })

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleSuccessNotification();
  };

  const handleError = () => {
    handleErrorNotification();
  };

  const handleSuccessNotification = () => {
    dispatch({
      type: "success",
      message: "Successfully Registered",
      title: "Tx Notification",
      position: "topR",
    });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };
  const handleErrorNotification = () => {
    dispatch({
      type: "error",
      message: "ID Already Taken",
      title: "ERROR",
      position: "topR",
    });
  };

  async function updateUI() {
    try {
      const tempStatus = (await getRegistrationStatus()).toString();
      setRegStatus(tempStatus);
      const check = await checkCandidateAlreadyRegisteredOrNot();
      setAlreadyRegistered(check);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (votingAddress) {
      updateUI();
    }
  }, [votingAddress]);

  return (
    <div className={styles.content}>
      <div className="container" style={{ width: "900px" }}>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header card-header-info">
                <h4 className="card-title h3 text-center">
                  Candidate Regstration
                </h4>
              </div>
              <div className="card-body">
                <div
                  className="container voting-container"
                  style={{ width: "700px" }}
                >
                  <form className="d-flex flex-direction-col">
                    <ConnectButton
                      onClick={(e) => e.preventDefault()}
                      moralisAuth={false}
                    />
                    {alreadyRegistered ? (
                      <div className="text-danger h4 p-2">
                        Candidate Already Registered
                      </div>
                    ) : (
                      ""
                    )}
                  </form>
                  {regStatus == "0" && votingAddress ? (
                    <div>
                      <form>
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            placeholder="Name"
                            onChange={(e) => {
                              setName(e.target.value);
                            }}
                          />
                        </div>
                      </form>
                      <form>
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            id="symbol"
                            placeholder="Unique ID"
                            onChange={(e) => {
                              setID(e.target.value);
                            }}
                          />
                        </div>
                      </form>
                      <form className="mt-3 d-flex justify-content-center">
                        <button
                          disabled={ID == "" || name == "" || alreadyRegistered}
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.preventDefault();
                            try {
                              registerCandidate({
                                onError: (error) => {
                                  handleError();
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
                          Register
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="h4 p-4 text-center">
                      Registration is closed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
