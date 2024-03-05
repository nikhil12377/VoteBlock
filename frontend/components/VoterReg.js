import styles from "../styles/voting.module.css";
import { ConnectButton } from "@web3uikit/web3";

import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useMoralis, useWeb3Contract } from "react-moralis";
const WebcamComponent = () => <Webcam />;
const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: "user",
};
import { abi, contractAddress } from "../constants/index";
import { useNotification } from "@web3uikit/core";

const useContractFunction = (votingAddress, functionName) => {
  return useWeb3Contract({
    abi: abi,
    contractAddress: votingAddress,
    functionName: functionName,
    params: {},
  }).runContractFunction;
};

export default function VoterReg() {
  const [user, setUser] = useState("");
  const [correctOtp, setCorrectOtp] = useState("");
  const [regStatus, setRegStatus] = useState("1");
  const { chainId: chainID } = useMoralis();
  const chainId = parseInt(chainID);
  const [picture, setPicture] = useState("");
  const [clickPicture, setClickPicture] = useState(false);
  const [otp, setOtp] = useState(0);
  const [tempOtp, setTempOtp] = useState(0);
  const [mobileNumber, setMobileNumber] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userAlreadyRegistered, setUserAlreadyRegistered] = useState(false);
  const dispatch = useNotification();

  const userAddress = useMoralis().account;

  const votingAddress =
    chainId in contractAddress ? contractAddress[chainId] : null;

  const getRegistrationStatus = useContractFunction(votingAddress, "getRegistrationStatus");
  const checkVoterIsValidOrNot = useContractFunction(votingAddress, "checkVoterIsValidOrNot");
  const registerVoter = useContractFunction(votingAddress, "registerVoter");

  const webcamRef = React.useRef(null);
  const capture = React.useCallback(() => {
    const pictureSrc = webcamRef.current.getScreenshot();
    setPicture(pictureSrc);
    localStorage.setItem("file", JSON.stringify(pictureSrc));
  });

  async function sendOTP() {
    const temppOtp = Math.floor(100000 + Math.random() * 900000);
    console.log(temppOtp);
    setOtp(temppOtp);
    try {
      // await fetch(
      //   "https://api.twilio.com/2010-04-01/Accounts/AC8aca684b02c6442e8584d964d527eeee/Messages.json",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/x-www-form-urlencoded",
      //       Authorization:
      //         "Basic " +
      //         btoa(
      //           "AC8aca684b02c6442e8584d964d527eeee:88efbf012ee91b5fef5a3daa872c0793"
      //         ),
      //     },
      //     body: `Body=Your OTP is ${temppOtp}&From=+19202892049&To=+91${mobileNumber}`,
      //   }
      // );
    } catch (error) {
      console.log(error);
    }
  }

  function verifyOTP() {
    if (otp == tempOtp) {
      setCorrectOtp("true");
    } else {
      setCorrectOtp("false");
    }
  }

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleSuccessNotification(tx);
  };

  const handleSuccessNotification = (tx) => {
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

  async function updateUI() {
    try {
      const tempStatus = (await getRegistrationStatus()).toString();
      setRegStatus(tempStatus);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (votingAddress) {
      updateUI();
    }

    setUser(userAddress);
    console.log(userAddress);
    var temp;
    async function check() {
      temp = await checkVoterIsValidOrNot({
        onError: (error) => console.log(error),
      });
      console.log(temp);
      setUserAlreadyRegistered(temp);
    }
    check();
  }, [votingAddress]);

  return (
    <div className={styles.content}>
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
                      <ConnectButton
                        onClick={(e) => e.preventDefault()}
                        moralisAuth={false}
                      />
                      {userAlreadyRegistered ? (
                        <div className="h4 p-2 text-danger">
                          Voter Already Registered
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
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
                          />
                        </div>
                      </form>
                      <form>
                        <div className="form-group">
                          <div className="d-flex direction-col">
                            <input
                              type="number"
                              className="form-control mr-2"
                              id="number"
                              placeholder="Enter Mobile Number"
                              onChange={(e) => {
                                setMobileNumber(e.target.value);
                              }}
                            />
                            <input
                              type="text"
                              className="form-control ml-2"
                              id="otp"
                              placeholder="Enter OTP"
                              onChange={(e) => {
                                setTempOtp(e.target.value);
                              }}
                            />
                          </div>
                          <button
                            className="btn btn-primary mt-3"
                            onClick={async (e) => {
                              e.preventDefault();
                              sendOTP();
                            }}
                          >
                            Request OTP
                          </button>
                          <button
                            className="btn btn-primary mt-3 mx-4"
                            onClick={(e) => {
                              e.preventDefault();
                              verifyOTP();
                            }}
                          >
                            Verify OTP
                          </button>
                          {correctOtp == "true" ? (
                            <div className="text-success h4 p-2">
                              OTP Verified Successfully
                            </div>
                          ) : correctOtp == "false" ? (
                            <div className="text-danger h4 p-2">
                              Incorrect OTP
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </form>

                      <form>
                        {clickPicture ? (
                          <div className="container mt-5">
                            <div>
                              <h2 className="mb-5 text-center">
                                Capture Your Photo
                              </h2>
                              <div>
                                {picture == "" ? (
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
                                {picture != "" ? (
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
                                    className="btn btn-danger"
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
                              <div>Image saved successfully</div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        )}
                      </form>

                      <form className="mt-3 d-flex justify-content-center">
                        <button
                          disabled={
                            // !correctOtp ||
                            picture == "" || user == "" || userAlreadyRegistered
                          }
                          className="btn btn-primary"
                          onClick={async (e) => {
                            e.preventDefault();
                            await registerVoter({
                              onError: (error) => {
                                console.log(error);
                              },
                              onSuccess: (tx) => {
                                handleSuccess(tx);
                              },
                            });
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
