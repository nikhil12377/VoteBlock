import { ConnectWallet, Web3Button, useChainId, useContract, useContractRead } from "@thirdweb-dev/react";
import { CHAIN, CHAINID, CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/voting.module.css";
import { useState } from "react";

export default function Candidate() {
  const chainId = useChainId();
  const { contract } = useContract(CONTRACT_ADDRESS);
  const [name, setName] = useState("");
  const [ID, setID] = useState("");
  const { data: alreadyRegistered } = useContractRead(contract, "checkCandidateAlreadyRegisteredOrNot");
  const { data: regStatus } = useContractRead(contract, "getRegistrationStatus");

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
                  <ConnectWallet />
                  <form className="d-flex flex-direction-col">

                    {alreadyRegistered ? (
                      <div className="text-danger h4 p-2">
                        Candidate Already Registered
                      </div>
                    ) : (
                      ""
                    )}
                  </form>
                  {chainId?.toString() !== CHAINID ? <div className="text-danger h4 p-2">Please Connect to {CHAIN}</div> :
                    regStatus === 0 ? (
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
                          <Web3Button
                            contractAddress={CONTRACT_ADDRESS as string}
                            action={async (contract) => {
                              try {
                                await contract?.call("registerCandidate", [ID, name]);
                              } catch (error) {
                                console.log("Error while Candidate Registration: ", error);
                              }
                            }}
                            isDisabled={ID == "" || name == "" || alreadyRegistered}
                            className="btn btn-primary"
                          >
                            Register
                          </Web3Button>
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
