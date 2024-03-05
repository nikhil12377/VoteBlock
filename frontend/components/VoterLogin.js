import styles from "../styles/voting.module.css";
import { ConnectButton } from "@web3uikit/web3";
import {
  bufferToImage,
  detectAllFaces,
  euclideanDistance,
  nets,
} from "face-api.js";

import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddress } from "../constants/index";
import { useNotification } from "@web3uikit/core";

const WebcamComponent = () => <Webcam />;
const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: "user",
};

export default function VoterLogin() {
  const { chainId: chainID } = useMoralis();
  const chainId = parseInt(chainID);
  const [picture, setPicture] = useState("");
  const [clickPicture, setClickPicture] = useState(false);
  const [faceMatched, setFaceMatched] = useState("");
  const [faceMatchError, setFaceMatchError] = useState(false);
  const [user, setUser] = useState("");
  const [userRegistered, setUserRegistered] = useState("");
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const dispatch = useNotification();

  const userAddress = useMoralis().account;

  const votingAddress =
    chainId in contractAddress ? contractAddress[chainId] : null;

  const webcamRef = React.useRef(null);
  var loginFace;
  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const capture = React.useCallback(async () => {
    console.log(1);
    const pictureSrc = await webcamRef.current.getScreenshot();
    setPicture(pictureSrc);
    loginFace = dataURLtoFile(pictureSrc, "loginFace");
    start();
  });

  const { runContractFunction: checkVoterIsValidOrNot } = useWeb3Contract({
    abi: abi,
    contractAddress: votingAddress,
    functionName: "checkVoterIsValidOrNot",
    params: {},
  });

  async function start() {
    let descriptor1, descriptor2;

    try {
      console.log(2);
      const regFaceSrc = localStorage.getItem("file");
      const regFace = dataURLtoFile(JSON.parse(regFaceSrc), "regFace");
      const image1 = await bufferToImage(loginFace);
      descriptor1 = await detectAllFaces(image1)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const image2 = await bufferToImage(regFace);
      descriptor2 = await detectAllFaces(image2)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const distance = euclideanDistance(
        descriptor1[0].descriptor,
        descriptor2[0].descriptor
      );
      console.log(distance);
      if (distance < 3.5) {
        setFaceMatched("true");
      } else {
        setFaceMatched("false");
      }
    } catch (error) {
      setFaceMatchError(true);
      console.log(error);
    }
  }

  const handleSuccess = () => {
    handleSuccessNotification();
  };

  const handleSuccessNotification = () => {
    dispatch({
      type: "success",
      message: "Logged In Successfully",
      title: "Tx Notification",
      position: "topR",
    });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  useEffect(() => {
    var temp;
    async function check() {
      temp = await checkVoterIsValidOrNot({
        onError: (error) => {
          console.log(error);
        },
      });
      setUserRegistered(temp ? "true" : "false");
      console.log(temp);
    }
    check();
    setUser(userAddress);
    if (localStorage.getItem("LoggedIn") == "true") {
      setAlreadyLoggedIn(true);
    } else {
      setAlreadyLoggedIn(false);
    }
    async function loadModels() {
      Promise.all([
        nets.faceRecognitionNet.loadFromUri("/models"),
        nets.faceLandmark68Net.loadFromUri("/models"),
        nets.ssdMobilenetv1.loadFromUri("/models"),
      ]);
    }
    loadModels();
  }, [votingAddress]);

  return (
    <div className={styles.content}>
      <div className="container" style={{ width: "900px" }}>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header card-header-info">
                <h4 className="card-title h3 text-center">Voter Login</h4>
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
                      {userRegistered == "false" ? (
                        <div className="h4 p-2 text-danger">
                          Voter Not Registered yet!
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </form>
                  {alreadyLoggedIn ? (
                    <div className="text-center p-4">
                      <div className="h4 text-success">
                        You Are Already Logged In!
                      </div>
                      <button
                        className="btn h5 btn-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          localStorage.setItem("LoggedIn", false);
                          setAlreadyLoggedIn(false);
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div>
                      <form>
                        {clickPicture ? (
                          <div className="container mt-5">
                            <div>
                              <h2 className="mb-5 text-center">
                                React Photo Capture using Webcam Examle
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
                                        setFaceMatchError(false);
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
                            <div>
                              {faceMatched != "" ? (
                                faceMatched == "true" ? (
                                  <div className="h4 text-success">
                                    Face Matched
                                  </div>
                                ) : (
                                  <div className="h4 text-danger">
                                    Face Did Not Match
                                  </div>
                                )
                              ) : faceMatchError ? (
                                <div className="h4 text-danger">
                                  Face Did Not Match
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        )}
                      </form>

                      <form className="mt-3 d-flex justify-content-center">
                        <button
                          disabled={
                            faceMatchError ||
                            faceMatched == "" ||
                            user == "" ||
                            !userRegistered
                          }
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.preventDefault();
                            localStorage.setItem("LoggedIn", true);
                            handleSuccess();
                          }}
                        >
                          Login
                        </button>
                      </form>
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
