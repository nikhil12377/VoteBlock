import React, { useEffect, useState } from "react";
import styles from "../styles/voting.module.css";

import { ConnectButton } from "@web3uikit/web3";
import { abi, contractAddress } from "../constants/index";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "@web3uikit/core";
import Webcam from "react-webcam";
import {
  bufferToImage,
  detectAllFaces,
  euclideanDistance,
  nets,
} from "face-api.js";
import { CHAIN, CHAINID } from "../config";

const WebcamComponent = () => <Webcam />;
const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: "user",
};

const useContractFunction = (votingAddress, functionName, params) => {
  return useWeb3Contract({
    abi: abi,
    contractAddress: votingAddress,
    functionName: functionName,
    params: params,
  }).runContractFunction;
};

export default function Voting() {
  const [candidates, setCandidates] = useState([]);
  const [voteStatus, setVoteStatus] = useState("1");
  const [voterValid, setVoterValid] = useState(true);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [startVote, setStartVote] = useState(false);
  const [faceMatched, setFaceMatched] = useState(false);
  const [faceMatchError, setFaceMatchError] = useState(false);
  const { chainId: chainID } = useMoralis();
  const chainId = parseInt(chainID);
  const dispatch = useNotification();
  const userAddress = useMoralis().account || "";

  const votingAddress =
    chainId in contractAddress ? contractAddress[chainId] : null;

  const getVotingStatus = useContractFunction(votingAddress, "getVotingStatus", {});
  const getCandidates = useContractFunction(votingAddress, "getCandidates", {});
  const vote = useContractFunction(votingAddress, "vote", { _candidateId: selectedCandidate });
  const checkVoterIsValidOrNot = useContractFunction(votingAddress, "checkVoterIsValidOrNot", {});
  const checkVoterAlreadyVotedOrNot = useContractFunction(votingAddress, "checkVoterAlreadyVotedOrNot", {});

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleSuccessNotification();
  };

  const handleSuccessNotification = () => {
    dispatch({
      type: "success",
      message: "Voted Successfully",
      title: "Tx Notification",
      position: "topR",
    });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleError = (error) => {
    handleErrorNotification(error);
  };

  const handleErrorNotification = (error) => {
    dispatch({
      type: "error",
      message: "You Have Already Voted",
      title: "Tx Notification",
      position: "topR",
    });
  };

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
  var image1;
  var votingFace;
  const webcamRef = React.useRef(null);
  const capture = React.useCallback(async () => {
    try {
      const pictureSrc = webcamRef.current.getScreenshot();
      votingFace = dataURLtoFile(pictureSrc, "votingFace");
      image1 = await bufferToImage(votingFace);
      start();
    } catch (error) {
      console.log(error);
    }
  });

  async function start() {
    let descriptor1, descriptor2;

    try {
      descriptor1 = await detectAllFaces(image1)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const regFaceSrc = localStorage.getItem("file");
      const regFace = dataURLtoFile(JSON.parse(regFaceSrc), "regFace");
      const image2 = await bufferToImage(regFace);
      descriptor2 = await detectAllFaces(image2)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const distance = euclideanDistance(
        descriptor1[0].descriptor,
        descriptor2[0].descriptor
      );
      console.log(distance);
      if (distance < 0.4) {
        setFaceMatched(true);
        setFaceMatchError(false);
        console.log(true);
      } else {
        setFaceMatched(false);
        setFaceMatchError(true);
        console.log(false);
      }
    } catch (error) {
      setFaceMatched(false);
      setFaceMatchError(true);
      console.log(error);
    }
  }

  useEffect(() => {
    async function loadModels() {
      Promise.all([
        nets.faceRecognitionNet.loadFromUri("/models"),
        nets.faceLandmark68Net.loadFromUri("/models"),
        nets.ssdMobilenetv1.loadFromUri("/models"),
      ]);
    }
    loadModels();
  }, []);

  async function updateUI() {
    try {
      const valid = await checkVoterIsValidOrNot();
      setVoterValid(valid);
      const voted = await checkVoterAlreadyVotedOrNot();
      setAlreadyVoted(voted);
      const tempStatus = (await getVotingStatus()).toString();
      setVoteStatus(tempStatus);
      const tempCandidates = await getCandidates();
      console.log(tempCandidates);
      setCandidates(tempCandidates);
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
                <h4 className="card-title text-center h3">Voting Zone</h4>
              </div>
              <div className="card-body">
                <div
                  className="container voting-container"
                  style={{ width: "700px" }}
                >
                  <form className="mt-3">
                    <ConnectButton
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      moralisAuth={false}
                    />
                  </form>
                  {chainId.toString() !== CHAINID ? <div className="text-danger h4 p-2">Please Connect to {CHAIN}</div> : voterValid ? (
                    alreadyVoted ? (
                      <div className="h4 p-2 text-danger">
                        Voter Already Voted
                      </div>
                    ) : startVote ? (
                      voteStatus == "0" &&
                        votingAddress ? (
                        <div className="mt-5" id="content">
                          <div>
                            <Webcam
                              audio={false}
                              height={400}
                              ref={webcamRef}
                              width={400}
                              screenshotFormat="image/jpeg"
                              videoConstraints={videoConstraints}
                              onTimeUpdate={() => {
                                setTimeout(() => {
                                  capture();
                                }, 1000);
                              }}
                            />
                            {faceMatched ? (
                              <div className="h4 p-2 text-success">
                                Face Matched
                              </div>
                            ) : faceMatchError ? (
                              <div className="h4 p-2 text-danger">
                                Face Does Not Match
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="h4 font-weight-bold">Candidates</div>
                          <table className="table">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Votes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {candidates.length > 0 ? (
                                candidates.map((candidate, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>
                                        <input
                                          name={candidate.id.toString()}
                                          className="selectCand"
                                          checked={
                                            selectedCandidate ===
                                            candidate.id.toString()
                                          }
                                          onChange={() => {
                                            setSelectedCandidate(
                                              candidate.id.toString()
                                            );
                                          }}
                                          type="checkbox"
                                        />
                                      </td>
                                      <td>{candidate.id.toString()}</td>
                                      <td>{candidate.name}</td>
                                      <td>{candidate.votes}</td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td></td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          <form>
                            <button
                              disabled={faceMatchError || !faceMatched}
                              onClick={async (e) => {
                                e.preventDefault();
                                try {
                                  await vote({
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
                              type="submit"
                              className="btn btn-primary"
                            >
                              Cast your vote
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="h4 p-4 text-center">
                          Voting session is closed
                        </div>
                      )
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setStartVote(true);
                        }}
                      >
                        Click To Vote
                      </button>
                    )
                  ) : (
                    <div className="h4 p-2 text-danger">
                      Voter Not Registered
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
