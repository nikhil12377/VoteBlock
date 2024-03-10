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
import { CHAIN, CHAINID, FROM_NUMBER } from "../config";

const TWILIO_SID = process.env.NEXT_PUBLIC_TWILIO_SID
const TWILIO_AUTH_TOKEN = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN

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
  const [responseCode, setResponseCode] = useState(0);
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
    setOtp(temppOtp);
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              btoa(
                `${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`
              ),
          },
          body: `Body=Your OTP is ${temppOtp}&From=${FROM_NUMBER}&To=+91${mobileNumber}`,
        }
      );
      setResponseCode(response.status);
    } catch (error) {
      console.log(error);
    }
  }

  function verifyOTP() {
    if (otp == tempOtp) {
      setCorrectOtp("true");
      setResponseCode("");
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
                  {chainId.toString() !== CHAINID ? <div className="text-danger h4 p-2">Please Connect to {CHAIN}</div> : regStatus == "0" && votingAddress ? (
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
                          {responseCode === 200 && <div className="text-success h4 p-2">
                            OTP Sent Successfully
                          </div>}
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
                            !correctOtp ||
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
