import styles from "../styles/voting.module.css";

import { abi, contractAddress } from "../constants/index";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";

const useContractFunction = (votingAddress, functionName) => {
  return useWeb3Contract({
    abi: abi,
    contractAddress: votingAddress,
    functionName: functionName,
    params: {},
  }).runContractFunction;
};

export default function Result() {
  const [candidates, setCandidates] = useState([]);
  const [winners, setWinners] = useState([]);
  const [tie, setTie] = useState(false);
  const { chainId: chainID } = useMoralis();

  const chainId = parseInt(chainID);
  const votingAddress =
    chainId in contractAddress ? contractAddress[chainId] : null;

  const getCandidates = useContractFunction(votingAddress, "getCandidates");
  const getWinners = useContractFunction(votingAddress, "getWinners");

  async function updateUI() {
    try {
      const tempCandidates = await getCandidates();
      setCandidates(tempCandidates);
      console.log(tempCandidates);
      const tempWinners = await getWinners();
      setWinners(tempWinners);
      if (tempWinners.length > 1) {
        setTie(true);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (votingAddress) {
      updateUI();
    }
    console.log(chainId);
    console.log(votingAddress);
  }, [votingAddress]);

  return (
    <div className={styles.content}>
      <div className="container" style={{ width: "900px" }}>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header card-header-info">
                <h4 className="card-title">Results</h4>
              </div>
              <div>
                {tie ? (
                  <div className="h2 text-center p-2">It's a draw</div>
                ) : (
                  ""
                )}
              </div>
              <div className="card-body">
                {winners.length > 0 && winners != undefined ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Votes</th>
                      </tr>
                    </thead>
                    <tbody id="Results">
                      {winners.map((winner, index) => {
                        return (
                          <tr key={index}>
                            <th scope="col">{winner.id.toString()}</th>
                            <th scope="col">{winner.name}</th>
                            <th scope="col">{winner.voteCount.toString()}</th>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div id="not">
                    <h3>Election is Not Over Yet!</h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header card-header-info">
                <h4 className="card-title">Candidates</h4>
              </div>
              <div className="card-body">
                {candidates.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Votes</th>
                      </tr>
                    </thead>
                    <tbody id="Results">
                      {candidates.map((candidate, index) => {
                        return (
                          <tr key={index}>
                            <th scope="col">{candidate.id.toString()}</th>
                            <th scope="col">{candidate.name}</th>
                            <th scope="col">
                              {candidate.voteCount.toString()}
                            </th>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div id="not">
                    <h3>No Candidates Have Registered Yet!</h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
