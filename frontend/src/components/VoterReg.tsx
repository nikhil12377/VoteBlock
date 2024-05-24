import { ConnectWallet, Web3Button, useAddress, useChainId, useContract, useContractRead } from "@thirdweb-dev/react";
import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { CHAIN, CHAINID, CONTRACT_ADDRESS, videoConstraints } from "../constants";

export default function VoterReg() {
  const chainId = useChainId();
  const account = useAddress();
  const { contract } = useContract(CONTRACT_ADDRESS);
  const { data: alreadyRegistered } = useContractRead(contract, "checkCandidateAlreadyRegisteredOrNot");
  const { data: regStatus } = useContractRead(contract, "getRegistrationStatus");
  const [picture, setPicture] = useState("");
  const [clickPicture, setClickPicture] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const capture = useCallback(() => {
    const pictureSrc = webcamRef.current?.getScreenshot();
    if (pictureSrc) {
      setPicture(pictureSrc);
      localStorage.setItem("file", JSON.stringify(pictureSrc));
    }
  }, [webcamRef]);

  return (
    <div className="content">
      <div className="container" style={{ width: "900px" }}>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header card-header-info">
                <h4 className="card-title h3 text-center">
                  Voter Registration
                </h4>
              </div>

              <div className="card-body">
                <div
                  className="container voting-container"
                  style={{ width: "700px" }}
                >
                  <form>
                    <div className="form-group d-flex flex-direction-col">
                      <ConnectWallet
                      />
                      {alreadyRegistered ? (
                        <div className="h4 p-2 text-danger">
                          Voter Already Registered
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </form>
                  {chainId?.toString() !== CHAINID ? <div className="text-danger h4 p-2">Please Connect to {CHAIN}</div> : regStatus === 0 ? (
                    <div>
                      <form>
                        {clickPicture ? (
                          <div className="container mt-5">
                            <div>
                              <h2 className="mb-5 text-center">
                                Capture Your Photo
                              </h2>
                              <div>
                                {picture === "" ? (
                                  <Webcam
                                    audio={false}
                                    height={400}
                                    ref={webcamRef}
                                    width={400}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={videoConstraints}
                                  />
                                ) : (
                                  <img src={picture} />
                                )}
                              </div>
                              <div>
                                {picture !== "" ? (
                                  <div>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setClickPicture(false);
                                      }}
                                      className="btn btn-primary"
                                    >
                                      Done
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setPicture("");
                                      }}
                                      className="btn btn-primary"
                                    >
                                      Retake
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      capture();
                                    }}
                                    className="btn btn-primary"
                                  >
                                    Capture
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="form-group">
                              <div>
                                For verification purpose we need to click the
                                picture of user
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setClickPicture(true);
                              }}
                              className="btn btn-primary"
                            >
                              Capture image
                            </button>
                            {picture != "" ? (
                              <div className="text-success">Image saved successfully</div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        )}
                      </form>

                      <form className="mt-3 d-flex justify-content-center">
                        <Web3Button
                          contractAddress={CONTRACT_ADDRESS as string}
                          action={async (contract) => {
                            try {
                              await contract?.call("registerVoter");
                            } catch (error) {
                              console.log("Error while Candidate Registration: ", error);
                            }
                          }}
                          isDisabled={
                            picture == "" || account == "" || alreadyRegistered
                          }
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
    </div>)
}