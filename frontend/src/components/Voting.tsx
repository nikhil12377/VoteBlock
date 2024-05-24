import { ConnectWallet, Web3Button, useAddress, useChainId, useContract, useContractRead } from "@thirdweb-dev/react";
import { CHAIN, CHAINID, CONTRACT_ADDRESS, videoConstraints } from "../constants";
import Webcam from "react-webcam";
import { useState, useRef, useCallback, useEffect } from "react";
import { Candidate } from "../types";
import { dataURLtoFile, start } from "../utils/faceRecognition";
import { bufferToImage, nets } from "face-api.js";

export default function Voting() {
  const chainId = useChainId();
  const { contract } = useContract(CONTRACT_ADDRESS);
  const { data: alreadyVoted } = useContractRead(contract, "checkVoterAlreadyVotedOrNot");
  const { data: voterValid } = useContractRead(contract, "checkVoterIsValidOrNot");
  const { data: voteStatus } = useContractRead(contract, "getVotingStatus");
  const { data: candidates } = useContractRead(contract, "getCandidates");
  const [startVote, setStartVote] = useState<boolean>(true);
  const [faceMatched, setFaceMatched] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");

  const webcamRef = useRef<Webcam>(null);
  const capture = useCallback(async () => {
    try {
      const pictureSrc = webcamRef.current?.getScreenshot();
      const votingFace = dataURLtoFile(pictureSrc as string, "votingFace");
      const image1 = await bufferToImage(votingFace);
      const isFaceMatched = await start(image1);
      setFaceMatched(isFaceMatched);
    } catch (error) {
      console.log(error);
    }
  }, [setFaceMatched]);

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

  return (
    <div className="content">
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
                    <ConnectWallet
                    />
                  </form>
                  {chainId?.toString() !== CHAINID ? <div className="text-danger h4 p-2">Please Connect to {CHAIN}</div> : voterValid ? (
                    alreadyVoted ? (
                      <div className="h4 p-2 text-danger">
                        Voter Already Voted
                      </div>
                    ) : startVote ? (
                      voteStatus === 0 ? (
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
                            ) : (
                              <div className="h4 p-2 text-danger">
                                Face Does Not Match
                              </div>)}
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
                              {candidates && candidates.length > 0 ? (
                                candidates.map((candidate: Candidate, index: number) => {
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
                                      <td>{candidate.voteCount.toString()}</td>
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
                            <Web3Button
                              contractAddress={CONTRACT_ADDRESS as string}
                              action={async (contract) => {
                                try {
                                  await contract?.call("vote", [selectedCandidate]);
                                } catch (error) {
                                  console.log("Error While Voting: ", error);
                                }
                              }}
                              isDisabled={!faceMatched}
                              className="btn btn-primary"
                            >
                              Cast your vote
                            </Web3Button>
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
